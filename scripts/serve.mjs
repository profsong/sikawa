import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep, dirname } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';
import { log } from 'node:console';

const directory = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.env.PORT || 4176);
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.webmanifest':'application/manifest+json', '.png':'image/png', '.webp':'image/webp', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.txt':'text/plain; charset=utf-8' };
const server = createServer(async (request, response) => {
  try {
    if (!['GET','HEAD'].includes(request.method ?? '')) { response.writeHead(405); response.end(); return; }
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    let target = resolve(directory, `.${pathname}`);
    if (target !== directory && !target.startsWith(directory + sep)) { response.writeHead(403); response.end(); return; }
    if ((await stat(target)).isDirectory()) target = resolve(target, 'index.html');
    const content = await readFile(target);
    response.writeHead(200, { 'Content-Type':mime[extname(target)] ?? 'application/octet-stream', 'Cache-Control':extname(target)==='.html'||target.endsWith('sw.js')?'no-cache':'public, max-age=0', 'X-Content-Type-Options':'nosniff' });
    response.end(request.method==='HEAD'?undefined:content);
  } catch { response.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' }); response.end('페이지를 찾을 수 없어요.'); }
});
server.listen(port, '127.0.0.1', ()=>log(`시이카와 웹앱: http://localhost:${port}/`));
