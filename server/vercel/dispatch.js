const states = new Map();

function collectPlugin(plugin) {
  const mounts = [];
  const middlewares = {
    use(pathOrHandler, maybeHandler) {
      if (typeof pathOrHandler === 'string') {
        mounts.push({ path: pathOrHandler, handler: maybeHandler });
      } else if (typeof pathOrHandler === 'function') {
        mounts.push({ path: null, handler: pathOrHandler });
      }
    },
  };
  const server = { middlewares };
  if (typeof plugin?.configureServer === 'function') plugin.configureServer(server);
  if (typeof plugin?.configurePreviewServer === 'function' && mounts.length === 0) {
    plugin.configurePreviewServer(server);
  }
  return mounts;
}

export async function dispatchProvider(req, res, pluginFactory) {
  const key = pluginFactory;
  let mounts = states.get(key);
  if (!mounts) {
    const plugin = pluginFactory();
    mounts = collectPlugin(plugin);
    states.set(key, mounts);
  }

  const pathname = (() => {
    try { return new URL(req.url || '/', 'http://localhost').pathname; }
    catch { return req.url || '/'; }
  })();

  const match = mounts
    .filter((m) => !m.path || pathname === m.path || pathname.startsWith(m.path + '/'))
    .sort((a, b) => (b.path?.length || 0) - (a.path?.length || 0))[0];

  if (!match?.handler) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'GEV provider route not found' }));
    return;
  }

  let settled = false;
  await new Promise((resolve, reject) => {
    const next = (err) => {
      if (settled) return;
      settled = true;
      if (err) reject(err);
      else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'GEV provider route not found' }));
        resolve();
      }
    };
    Promise.resolve(match.handler(req, res, next)).then(() => {
      if (!settled && res.writableEnded) {
        settled = true;
        resolve();
      }
    }).catch((err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });
  });
}
