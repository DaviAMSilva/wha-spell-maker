/// <reference types="@cloudflare/workers-types" />

interface Env { ASSETS: Fetcher }

const CRAWLER_PATTERNS = [
    /adsbot-google/i,
    /ahrefsbot/i,
    /applebot/i,
    /baiduspider/i,
    /bingbot/i,
    /discordbot/i,
    /dotbot/i,
    /duckduckbot/i,
    /exabot/i,
    /facebookexternalhit/i,
    /facebot/i,
    /googlebot/i,
    /linkedinbot/i,
    /mediapartners-google/i,
    /mj12bot/i,
    /rogerbot/i,
    /semrushbot/i,
    /slackbot/i,
    /slurp/i,
    /sogou/i,
    /telegrambot/i,
    /twitterbot/i,
    /whatsapp/i,
    /yandexbot/i,
];

function isCrawler(request: Request): boolean {
    const ua = request.headers.get("user-agent") ?? "";
    return CRAWLER_PATTERNS.some(pattern => pattern.test(ua));
}

function rewriteTitles(response: Response, name: string): Response {
    return new HTMLRewriter()
        .on("title", {
            _buffer: "",
            text(chunk: Text): void {
                this._buffer += chunk.text;
                chunk.remove();
                if (chunk.lastInTextNode) {
                    chunk.after(`${name.trim()} Spell | ${this._buffer}`, { html: false });
                    this._buffer = "";
                }
            },
        } as any)
        .on('meta[name="title"]', {
            element(el: HTMLMetaElement): void {
                const content: string = el.getAttribute("content") ?? "";
                el.setAttribute("content", `${name.trim()} Spell | ${content}`);
            },
        })
        .on('meta[property="og:title"]', {
            element(el: HTMLMetaElement): void {
                const content: string = el.getAttribute("content") ?? "";
                el.setAttribute("content", `${name.trim()} Spell | ${content}`);
            },
        })
        .on('meta[name="twitter:title"]', {
            element(el: HTMLMetaElement): void {
                const content: string = el.getAttribute("content") ?? "";
                el.setAttribute("content", `${name.trim()} Spell | ${content}`);
            },
        })
        .transform(response);
}

async function decodeSpellName(spellParam: string): Promise<string | null> {
    try {
        const base64: string = spellParam.replace(/-/g, "+").replace(/_/g, "/");
        const binaryStr: string = atob(base64);
        const bytes = new Uint8Array(Array.from(binaryStr, (c: string) => c.charCodeAt(0)));

        const ds = new DecompressionStream("deflate-raw");
        const writer = ds.writable.getWriter();
        writer.write(bytes);
        writer.close();
        const decompressed: ArrayBuffer = await new Response(ds.readable).arrayBuffer();

        const json = JSON.parse(new TextDecoder().decode(decompressed)) as { "name"?: string };
        const name = json?.name;
        if (!name || name.length > 30) return null;
        return name;
    } catch {
        return null;
    }
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const spellParam: string | null = url.searchParams.get("spell");
        const accept = request.headers.get("accept") ?? "";
        const isHtmlRequest = accept.includes("text/html");

        const name = spellParam ? await decodeSpellName(spellParam) : null;

        // Serve pre-rendered HTML to crawlers hitting /
        if (isCrawler(request) && isHtmlRequest && url.pathname === "/") {
            const prerenderedUrl = new URL("/index-prerendered.html", url.origin);
            const prerenderedRequest = new Request(prerenderedUrl.toString(), { redirect: "follow" });
            const prerenderedResponse = await env.ASSETS.fetch(prerenderedRequest);

            const rewritten = name ? rewriteTitles(prerenderedResponse, name) : prerenderedResponse;

            // Then patch the Vary header on the already-transformed response
            const newHeaders = new Headers(rewritten.headers);
            newHeaders.set("Vary", "User-Agent");

            return new Response(rewritten.body, {
                status: rewritten.status,
                headers: newHeaders,
            });
        }

        const response: Response = await env.ASSETS.fetch(request);

        return name ? rewriteTitles(response, name) : response;
    }
} satisfies ExportedHandler<Env>;