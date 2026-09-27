/**
 * Vite plugin: public military aircraft proxy with cache and stale fallback.
 * Uses adsb.fi's public /v2/mil endpoint.
 */
export function adsbLolProxy() {
  let _cache = null;
  let _cacheAt = 0;
  let _cooldownUntil = 0;
  let _cooldownStatus = 0;
  const CACHE_MS = 12000;
  const RATE_LIMIT_COOLDOWN_MS = 30000;
  const SERVER_ERROR_COOLDOWN_MS = 15000;
  const COOLDOWN_MIN_MS = 5000;
  const COOLDOWN_MAX_MS = 120000;

  const clampCooldown = (ms) =>
    Math.min(COOLDOWN_MAX_MS, Math.max(COOLDOWN_MIN_MS, ms));

  const cooldownFor = (upstream, now) => {
    const raw = upstream.headers?.get?.('retry-after');
    if (raw) {
      const seconds = Number(raw);
      if (Number.isFinite(seconds) && seconds > 0)
        return clampCooldown(seconds * 1000);
      const at = Date.parse(raw);
      if (Number.isFinite(at) && at > now) return clampCooldown(at - now);
    }
    return upstream.status === 429
      ? RATE_LIMIT_COOLDOWN_MS
      : SERVER_ERROR_COOLDOWN_MS;
  };

  function serve(res, status, body, cacheStatus, extra = {}) {
    if (res.headersSent) return;
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-ADS-B-Cache': cacheStatus,
      ...(cacheStatus === 'HIT' || cacheStatus === 'STALE'
        ? { 'X-ADS-B-Cache-Age-Ms': String(Math.max(0, Date.now() - _cacheAt)) }
        : {}),
      ...extra,
    });
    res.end(body);
  }

  const installMiddleware = (server) => {
    server.middlewares.use('/api/adsblol/mil', async (_req, res) => {
      try {
        const now = Date.now();
        if (_cache && now - _cacheAt < CACHE_MS) {
          serve(res, 200, _cache, 'HIT');
          return;
        }
        if (now < _cooldownUntil) {
          if (_cache) {
            serve(res, 200, _cache, 'STALE', {
              'X-ADS-B-Source': 'adsb.fi',
              'X-ADS-B-Upstream-Status': String(_cooldownStatus),
            });
            return;
          }
          serve(res, _cooldownStatus || 503,
            JSON.stringify({ error: 'military ADS-B upstream cooling down' }),
            'NONE',
            { 'Retry-After': String(Math.ceil((_cooldownUntil - now) / 1000)) });
          return;
        }

        const upstream = await fetch('https://opendata.adsb.fi/api/v2/mil', {
          headers: {
            Accept: 'application/json',
            'User-Agent':
              'gods-eye-view-adsbfi-proxy/1.0 (+https://github.com/mwsmileprojects/gods-eye-view)',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (upstream.ok) {
          const body = await upstream.text();
          _cache = body;
          _cacheAt = Date.now();
          _cooldownUntil = 0;
          _cooldownStatus = 0;
          serve(res, 200, body, 'MISS', { 'X-ADS-B-Source': 'adsb.fi' });
          return;
        }

        const failedAt = Date.now();
        _cooldownUntil = failedAt + cooldownFor(upstream, failedAt);
        _cooldownStatus = upstream.status;

        if (_cache && (upstream.status === 429 || upstream.status >= 500)) {
          upstream.body?.cancel().catch(() => {});
          serve(res, 200, _cache, 'STALE', {
            'X-ADS-B-Source': 'adsb.fi',
            'X-ADS-B-Upstream-Status': String(upstream.status),
          });
          return;
        }

        const body = await upstream.text();
        serve(res, upstream.status, body, 'MISS', {
          'X-ADS-B-Source': 'adsb.fi',
        });
      } catch (error) {
        console.error('[adsb.fi military proxy]', error?.message || error);
        if (_cache) {
          serve(res, 200, _cache, 'STALE', { 'X-ADS-B-Source': 'adsb.fi' });
          return;
        }
        serve(res, 502,
          JSON.stringify({ error: 'Military ADS-B proxy unavailable' }), 'NONE');
      }
    });
  };

  return {
    name: 'adsblol-proxy',
    configureServer: installMiddleware,
    configurePreviewServer: installMiddleware,
  };
}