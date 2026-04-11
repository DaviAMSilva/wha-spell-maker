import { readFile, writeFile } from 'node:fs/promises'
import http, { type Server } from 'node:http'
import { extname, join, resolve } from 'node:path'
import puppeteer, { type Browser, type Page } from 'puppeteer'
import type { Plugin } from 'vite'

const MIME: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
}

function createServer(root: string, port: number): Promise<Server> {
    const server = http.createServer(async (req, res) => {
        try {
            let urlPath = (req.url ?? '/').split('?')[0]

            if (urlPath === '/') urlPath = '/index.html'

            const filePath = resolve(join(root, urlPath))
            const data = await readFile(filePath)

            const type = MIME[extname(filePath)] ?? 'application/octet-stream'

            res.writeHead(200, { 'Content-Type': type })
            res.end(data)
        } catch {
            res.writeHead(404)
            res.end('Not found')
        }
    })

    return new Promise((resolvePromise) => {
        server.listen(port, () => resolvePromise(server))
    })
}

export function prerenderPlugin(): Plugin {
    const outDir = 'dist';
    const output = 'index-prerendered.html';
    const port = 4173;

    return {
        name: 'vite-plugin-prerender',
        apply: 'build',
        enforce: 'post',

        async writeBundle(): Promise<void> {
            const distPath = resolve(outDir);

            let server: Server | null = null;
            let browser: Browser | null = null;

            try {
                server = await createServer(distPath, port);
                browser = await puppeteer.launch({
                    headless: true,
                });

                const page: Page = await browser.newPage();

                page.on('console', (msg) => {
                    console.log('[browser]', msg.text())
                });

                page.on('pageerror', (err) => {
                    console.error('[browser error]', err);
                    process.exit(1);
                });

                await page.goto(`http://localhost:${port}`, {
                    waitUntil: 'networkidle0',
                });

                await page.waitForFunction(() => (window as any).__PRERENDER_READY__ === true, { timeout: 5000 });

                const html: string = await page.content();
                const outputPath = resolve(distPath, output);
                await writeFile(outputPath, html, 'utf-8');

                console.log(`[prerender] Written: ${outputPath}`);
            } finally {
                if (browser) await browser.close();
                if (server) server.close();
            }
        },
    }
}