/**
 * Static server rooted at dist/, for verifying the BUILT extension the way
 * Chrome loads it: absolute /assets/… paths resolved against the bundle root.
 *
 * This closes the gap that let a CSS regression through — dev-harness.html
 * serves source modules through Vite, and preview:states renders templates to
 * a standalone file. Neither one loads dist/. This does.
 *
 *   node tools/serve-dist.mjs   → http://localhost:4180/src/ui/sidepanel/index.html
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const PORT = 4180;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.map': 'application/json; charset=utf-8',
};

createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${PORT}`);
  const target = path.join(root, decodeURIComponent(url.pathname));

  // Never serve outside dist/.
  if (!target.startsWith(root)) {
    response.writeHead(403).end('forbidden');
    return;
  }

  try {
    const info = await stat(target);
    if (info.isDirectory()) {
      response.writeHead(404).end('not found');
      return;
    }
    const body = await readFile(target);
    response.writeHead(200, {
      'content-type': TYPES[path.extname(target)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    response.end(body);
  } catch {
    response.writeHead(404).end(`not found: ${url.pathname}`);
  }
}).listen(PORT, () => {
  console.log(`serving dist/ at http://localhost:${PORT}`);
  console.log(`side panel: http://localhost:${PORT}/src/ui/sidepanel/index.html`);
});
