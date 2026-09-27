import { installRouteMiddleware } from '../server/providers/places/routes.js';

let handler;
function getHandler() {
  if (handler) return handler;
  const mounts = [];
  installRouteMiddleware({
    use(path, fn) { mounts.push({ path, fn }); },
  });
  handler = mounts.find((m) => m.path === '/api/route')?.fn;
  return handler;
}

export default async function route(req, res) {
  const fn = getHandler();
  if (!fn) { res.statusCode = 500; return res.end(JSON.stringify({ok:false,error:'Route provider unavailable'})); }
  return fn(req, res);
}
