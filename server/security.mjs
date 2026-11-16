import crypto from 'node:crypto'

/** Timing-safe string compare */
export function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ''), 'utf8')
  const bb = Buffer.from(String(b || ''), 'utf8')
  if (aa.length !== bb.length) {
    // still compare to keep rough timing similar
    crypto.timingSafeEqual(aa, aa)
    return false
  }
  return crypto.timingSafeEqual(aa, bb)
}

/** Parse "https://a.com,https://b.com" or "*" */
export function parseOrigins(raw) {
  const s = String(raw || '*').trim()
  if (!s || s === '*') return { any: true, list: [] }
  const list = s
    .split(',')
    .map((x) => x.trim().replace(/\/$/, ''))
    .filter(Boolean)
  return { any: false, list }
}

export function originAllowed(origin, cfg) {
  if (!origin) return cfg.any // same-origin / non-browser may omit
  if (cfg.any) return true
  const o = origin.replace(/\/$/, '')
  return cfg.list.includes(o)
}

/** Never echo upstream/vendor secrets or long dumps to clients */
export function publicError(err, status = 500) {
  const raw = err instanceof Error ? err.message : String(err || 'error')
  // Strip anything that looks like a key
  const scrubbed = raw
    .replace(/sk-[a-zA-Z0-9_-]+/g, '[redacted]')
    .replace(/Bearer\s+\S+/gi, 'Bearer [redacted]')
    .slice(0, 160)

  if (status === 429) return scrubbed || 'Rate limit exceeded'
  if (status === 401) return scrubbed || 'Unauthorized'
  if (status === 403) return scrubbed || 'Forbidden'
  if (status === 413) return 'Payload too large'
  if (status >= 500) return 'AI service temporarily unavailable'
  return scrubbed || 'Request failed'
}

export function clampInt(n, min, max, fallback) {
  const v = Number(n)
  if (!Number.isFinite(v)) return fallback
  return Math.min(max, Math.max(min, Math.floor(v)))
}
