import { createServer as createHttpServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.wasm': 'application/wasm',
    '.txt': 'text/plain; charset=utf-8',
  }[ext] || 'application/octet-stream';
}

async function serveStatic(req, res) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
  } catch {
    res.statusCode = 400;
    res.end('Bad Request');
    return;
  }

  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\\/+/, '');
  const candidate = path.resolve(dist, relative);

  if (!candidate.startsWith(dist + path.sep) && candidate !== dist) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  try {
    const stat = await fs.stat(candidate);
    if (!stat.isFile()) throw new Error('not a file');

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType(candidate));
    if (pathname.startsWith('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    res.end(await fs.readFile(candidate));
    return;
  } catch {
    // SPA fallback: client-side routes still receive the built index.
    try {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(await fs.readFile(path.join(dist, 'index.html')));
    } catch {
      res.statusCode = 500;
      res.end('God\'s Eye View build output is unavailable.');
    }
  }
}

// GEV's cost-bearing providers are intentionally server-side.
// Enable a conservative default throttle when this public deployment does
// not explicitly configure one. Provider-side billing limits remain required.
process.env.GEV_RATELIMIT_OPENAI_PER_MIN ??= '10';
process.env.GEV_RATELIMIT_GOOGLE_PER_MIN ??= '30';

const vite = await createViteServer({
  root,
  appType: 'spa',
  server: {
    middlewareMode: true,
  },
});

const server = createHttpServer(async (req, res) => {
  // All GEV provider endpoints stay behind the original server middleware.
  // This preserves the existing /api/* implementation instead of duplicating
  // dozens of provider handlers as separate Vercel functions.
  if ((req.url || '/').startsWith('/api/')) {
    vite.middlewares(req, res, () => {
      if (!res.writableEnded) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'API route not found' }));
      }
    });
    return;
  }

  await serveStatic(req, res);
});

server.listen(Number(process.env.PORT) || 3000);
