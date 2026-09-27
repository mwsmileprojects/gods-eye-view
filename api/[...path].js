import { createServer as createViteServer } from 'vite';
import { localProviderPlugins } from '../server/providers/local.js';

let middlewarePromise;

async function getMiddleware() {
  if (!middlewarePromise) {
    middlewarePromise = createViteServer({
      root: process.cwd(),
      appType: 'spa',
      plugins: localProviderPlugins(),
      server: { middlewareMode: true },
      logLevel: 'error',
    }).then((vite) => vite.middlewares);
  }
  return middlewarePromise;
}

export default async function handler(req, res) {
  const middleware = await getMiddleware();

  await new Promise((resolve) => {
    middleware(req, res, () => {
      if (!res.writableEnded) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'GEV API route not found' }));
      }
      resolve();
    });
  });
}
