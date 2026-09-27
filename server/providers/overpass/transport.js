import {
  OVERPASS_MAX_RESPONSE_BYTES,
  OVERPASS_UPSTREAMS,
  OVERPASS_USER_AGENT,
  OVERPASS_TIMEOUT_MS,
} from './constants.js';
import { readResponseTextCapped } from '../common/http.js';
import { simplifyOverpassPayloadBody } from './geometry.js';

/**
 * Detect whether an Overpass API response body indicates rate-limiting.
 *
 * Checks for known rate-limit phrases in the body text regardless of
 * HTTP status code, since some mirrors return 200 with an error payload.
 *
 * @param {string} bodyText - Upstream response body.
 * @returns {boolean} True if the body looks rate-limited.
 */
function overpassLooksRateLimited(bodyText) {
  const text = String(bodyText || '').toLowerCase();
  return (
    text.includes('rate_limited') ||
    text.includes('quota of your ip address') ||
    text.includes('dispatcher_client::request_read_and_idx::rate_limited') ||
    text.includes('too many requests')
  );
}

/**
 * Detect an Overpass HTTP-200 body that is actually a runtime FAILURE (server-side
 * timeout / out-of-memory) via its `remark`. These are transient upstream failures,
 * not authoritative empty results, so they must not be returned or cached.
 */
function overpassLooksRuntimeError(bodyText) {
  const text = String(bodyText || '').toLowerCase();
  return (
    text.includes('runtime error') ||
    text.includes('timed out') ||
    text.includes('out of memory')
  );
}

/**
 * True only for an upstream response that is actually Overpass data.
 *
 * The proxy caches on this and serves stale on its negation, so the two
 * decisions cannot drift apart: a payload that is not data must never be
 * written to the cache and must always be eligible for a stale replacement.
 * @param {{status: number, rateLimited?: boolean, runtimeError?: boolean}} payload
 * @returns {boolean}
 */
function overpassPayloadIsData(payload) {
  const status = Number(payload?.status);
  return (
    Number.isFinite(status) &&
    status >= 200 &&
    status < 300 &&
    !payload.rateLimited &&
    !payload.runtimeError
  );
}

/**
 * Try each mirror once, retaining response-size and per-mirror timeout caps.
 * Refusals and body-level failures rotate; total failure returns the last
 * rate-limit payload, otherwise the first refusal, or throws a network error.
 * @param {string} body URL-encoded Overpass QL query body.
 * @param {number} [maxResponseBytes] Endpoint-specific response cap.
 * @param {object} [options] Server-only endpoint and I/O overrides for tests.
 * @returns {Promise<{status:number,body:string,contentType:string,endpoint:string,rateLimited:boolean}>}
 */
async function fetchOverpassPayload(
  body,
  maxResponseBytes = OVERPASS_MAX_RESPONSE_BYTES,
  {
    endpoints = OVERPASS_UPSTREAMS,
    fetchImpl = fetch,
    readBody = readResponseTextCapped,
    simplify = simplifyOverpassPayloadBody,
  } = {},
) {
  const attempts = endpoints.map(async (endpoint) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);
    try {
      const upstream = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': OVERPASS_USER_AGENT,
        },
        body,
        signal: controller.signal,
      });
      const responseBody = await readBody(upstream, maxResponseBytes);
      const contentType =
        upstream.headers.get('content-type') || 'application/json';
      const status = upstream.status;
      const rateLimited =
        status === 429 || overpassLooksRateLimited(responseBody);
      const runtimeError = overpassLooksRuntimeError(responseBody);
      const payload = {
        status, body: responseBody, contentType, endpoint,
        rateLimited, runtimeError,
      };
      if (rateLimited || runtimeError || status < 200 || status >= 300) {
        return { ok: false, payload };
      }
      payload.body = simplify(payload.body);
      return { ok: true, payload };
    } catch (error) {
      return { ok: false, error, endpoint };
    } finally {
      clearTimeout(timeoutId);
    }
  });

  const results = await Promise.all(attempts);
  const success = results.find((result) => result.ok);
  if (success) return success.payload;

  const rateLimited = results.find((result) => result.payload?.rateLimited);
  if (rateLimited) return rateLimited.payload;

  const refusal = results.find((result) => result.payload);
  if (refusal) return refusal.payload;

  throw (
    results.find((result) => result.error)?.error ||
    new Error('All Overpass upstreams failed')
  );
}
