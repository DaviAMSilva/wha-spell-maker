/// <reference types="@cloudflare/workers-types" />

interface Env { ASSETS: Fetcher }

function transformResponse(response: Response, spellName: string | null): Response {
    const rewriter = new HTMLRewriter().on("head", {
        element(el: Element): void {
            el.append('<meta name="robots" content="noindex">', { html: true });
        },
    });

    if (spellName) {
        rewriter
            .on("title", {
                _buffer: "",
                text(chunk: Text): void {
                    this._buffer += chunk.text;
                    chunk.remove();
                    if (chunk.lastInTextNode) {
                        chunk.after(`${spellName.trim()} Spell | ${this._buffer}`, { html: false });
                        this._buffer = "";
                    }
                },
            } as any)
            .on('meta[name="title"]', {
                element(el: HTMLMetaElement): void {
                    const content: string = el.getAttribute("content") ?? "";
                    el.setAttribute("content", `${spellName.trim()} Spell | ${content}`);
                },
            })
            .on('meta[property="og:title"]', {
                element(el: HTMLMetaElement): void {
                    const content: string = el.getAttribute("content") ?? "";
                    el.setAttribute("content", `${spellName.trim()} Spell | ${content}`);
                },
            })
            .on('meta[name="twitter:title"]', {
                element(el: HTMLMetaElement): void {
                    const content: string = el.getAttribute("content") ?? "";
                    el.setAttribute("content", `${spellName.trim()} Spell | ${content}`);
                },
            });
    }

    return rewriter.transform(response);
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

        if (!spellParam) {
            return env.ASSETS.fetch(request);
        }

        const [response, spellName] = await Promise.all([
            env.ASSETS.fetch(request),
            decodeSpellName(spellParam),
        ]);

        return transformResponse(response, spellName);
    }
} satisfies ExportedHandler<Env>;