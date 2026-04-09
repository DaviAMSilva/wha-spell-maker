/// <reference types="@cloudflare/workers-types" />

interface Env { ASSETS: Fetcher }

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const spellParam: string | null = url.searchParams.get("spell");

        const response: Response = await env.ASSETS.fetch(request);

        if (!spellParam) return response;

        try {
            // 1. Decode base64url → bytes
            const base64: string = spellParam.replace(/-/g, "+").replace(/_/g, "/");
            const binaryStr: string = atob(base64);
            const bytes = new Uint8Array(Array.from(binaryStr, (c: string) => c.charCodeAt(0)));

            // 2. Decompress with deflate-raw
            const ds = new DecompressionStream("deflate-raw");
            const writer = ds.writable.getWriter();
            writer.write(bytes);
            writer.close();
            const decompressed: ArrayBuffer = await new Response(ds.readable).arrayBuffer();

            // 3. Parse JSON, validate shape, extract name
            const json = JSON.parse(new TextDecoder().decode(decompressed)) as { "name"?: string };
            const name = json?.name;
            if (!name || name.length > 30) return response;

            // 4. Rewrite title tags
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
        } catch {
            return response;
        }
    }
} satisfies ExportedHandler<Env>;