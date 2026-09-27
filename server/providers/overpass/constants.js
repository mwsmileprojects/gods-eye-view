import path from 'node:path';

// ---------------------------------------------------------------------------
// Overpass API proxy constants and cache state
// ---------------------------------------------------------------------------
const OVERPASS_USER_AGENT =
  'gods-eye-view/0.1 (+https://github.com/bilawalsidhu/gods-eye-view)';

const OVERPASS_UPSTREAMS = [
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
];

const OVERPASS_CACHE_MS = 86_400_000;
const OVERPASS_DISK_TTL_MS = 7 * 86_400_000;
const OVERPASS_BOUNDARY_DISK_TTL_MS = 30 * 86_400_000;

// Vercel Functions have a read-only filesystem; use /tmp for ephemeral cache.
// Local development still gets a project-local cache.
const OVERPASS_DISK_DIR =
  process.env.VERCEL === '1'
    ? '/tmp/gev-cache/overpass'
    : path.join(process.cwd(), '.gev-cache', 'overpass');

const OVERPASS_TIMEOUT_MS = 7000;
const OVERPASS_CACHE_MAX_ENTRIES = 120;
const OVERPASS_MAX_BODY_BYTES = 24 * 1024;
const OVERPASS_MAX_RESPONSE_BYTES = 32 * 1024 * 1024;
const OVERPASS_SIMPLIFY_MIN_BYTES = 1_500_000;
const OVERPASS_SIMPLIFY_MIN_POINTS = 1200;
const OVERPASS_SIMPLIFY_TOLERANCE_DEG = 0.0004;
const OVERPASS_MAX_CONCURRENT = 6;
const OVERPASS_MAX_QL_TIMEOUT = 30;
const OVERPASS_MAX_AROUND_M = 50000;
const OVERPASS_MAX_BBOX_DEG = 12;
const OVERPASS_ELEMENT_TYPES = 'node|way|relation|nwr|nw|nr|wr|rel';
const OVERPASS_SELECTOR_RE = new RegExp(
  `\\\\b(?:${OVERPASS_ELEMENT_TYPES}|area)\\\\b`,
);
const OVERPASS_AREA_ELEMENT_RE = new RegExp(
  `\\\\b(?:${OVERPASS_ELEMENT_TYPES})\\\\s*\\\\(\\\\s*area\\\\b`,
  'i',
);
const OVERPASS_BBOX_RE =
  /\\(\\s*-?\\d+(?:\\.\\d+)?\\s*,\\s*-?\\d+(?:\\.\\d+)?\\s*,\\s*-?\\d+(?:\\.\\d+)?\\s*,\\s*-?\\d+(?:\\.\\d+)?\\s*\\)/;

export {
  OVERPASS_BOUNDARY_DISK_TTL_MS,
  OVERPASS_DISK_TTL_MS,
  OVERPASS_DISK_DIR,
  OVERPASS_CACHE_MS,
  OVERPASS_CACHE_MAX_ENTRIES,
  OVERPASS_MAX_BODY_BYTES,
  OVERPASS_MAX_CONCURRENT,
  OVERPASS_MAX_AROUND_M,
  OVERPASS_MAX_BBOX_DEG,
  OVERPASS_AREA_ELEMENT_RE,
  OVERPASS_SELECTOR_RE,
  OVERPASS_BBOX_RE,
  OVERPASS_MAX_QL_TIMEOUT,
  OVERPASS_SIMPLIFY_MIN_BYTES,
  OVERPASS_SIMPLIFY_MIN_POINTS,
  OVERPASS_SIMPLIFY_TOLERANCE_DEG,
  OVERPASS_MAX_RESPONSE_BYTES,
  OVERPASS_UPSTREAMS,
  OVERPASS_USER_AGENT,
  OVERPASS_TIMEOUT_MS,
};