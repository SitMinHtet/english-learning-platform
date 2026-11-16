/**
 * In-memory sliding window rate limiter (per process).
 * For multi-instance hosts, replace with Redis later.
 */

/** @typedef {{ count: number, resetAt: number }} Bucket */

const store = new Map()

/**
 * @param {string} key
 * @param {number} limit
 * @param {number} windowMs
 */
export function take(key, limit, windowMs) {
  const now = Date.now()
  let b = store.get(key)
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + windowMs }
    store.set(key, b)
  }
  if (b.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: b.resetAt,
      retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
    }
  }
  b.count += 1
  return {
    ok: true,
    remaining: Math.max(0, limit - b.count),
    resetAt: b.resetAt,
    retryAfterSec: 0,
  }
}

/** Occasional cleanup so Map does not grow forever */
export function sweep() {
  const now = Date.now()
  for (const [k, b] of store) {
    if (now >= b.resetAt) store.delete(k)
  }
}

setInterval(sweep, 60_000).unref?.()
