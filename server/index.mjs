/**
 * Path to C2 — hardened AI proxy (free public soft-launch)
 *
 * Security goals:
 * - OPENAI_API_KEY never leaves this process
 * - Clients cannot pick expensive models / high max_tokens
 * - Origin allowlist + optional app token + invite code
 * - Per-IP (+ client) rate limits + global daily budget
 * - Upstream errors scrubbed (no key leakage)
 *
 * Start: node server/index.mjs
 */

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { take } from './rateLimit.mjs'
import {
  clampInt,
  originAllowed,
  parseOrigins,
  publicError,
  safeEqual,
} from './security.mjs'
import {
  bearerUser,
  cloudAuthEnabled,
  getGoogleClientId,
  signSession,
  verifyGoogleIdToken,
} from './auth.mjs'
import { readCloudProfile, writeCloudProfile } from './cloudStore.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
loadEnvFile(path.join(root, '.env'))

const PORT = Number(process.env.PORT || 8787)
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || '').trim()
const OPENAI_BASE_URL = (
  process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
).replace(/\/$/, '')
/** Server-owned model only — clients cannot override */
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

const SOFT_LAUNCH_CODE = (process.env.SOFT_LAUNCH_CODE || '').trim()
/** Optional shared token (VITE_PROXY_APP_TOKEN) — raises bar vs naive curl */
const PROXY_APP_TOKEN = (process.env.PROXY_APP_TOKEN || '').trim()
/** Set to your real site(s), e.g. https://yourapp.com — avoid * in production */
const ORIGIN_CFG = parseOrigins(process.env.CORS_ORIGIN || '*')
const SERVE_STATIC = process.env.SERVE_STATIC === '1'
const DIST = path.join(root, 'dist')

/** Free-public defaults (override via env) */
const LIMITS = {
  // Defaults sized so one "AI daily pack" (~7 sequential calls) can finish
  minute: clampInt(process.env.RATE_MINUTE, 1, 120, 20),
  hour: clampInt(process.env.RATE_HOUR, 1, 500, 60),
  day: clampInt(process.env.RATE_DAY, 1, 2000, 80),
  tutor_day: clampInt(process.env.RATE_TUTOR_DAY, 1, 500, 40),
  lookup_day: clampInt(process.env.RATE_LOOKUP_DAY, 1, 500, 40),
  daily_day: clampInt(process.env.RATE_DAILY_DAY, 1, 200, 40),
  weekly_day: clampInt(process.env.RATE_WEEKLY_DAY, 1, 50, 8),
  /** Hard cap across ALL users (protects your free bill) */
  global_day: clampInt(process.env.RATE_GLOBAL_DAY, 10, 100000, 2500),
  concurrent_ip: clampInt(process.env.RATE_CONCURRENT_IP, 1, 10, 3),
}

const MAX_TOKENS = {
  tutor: clampInt(process.env.MAX_TOKENS_TUTOR, 64, 2000, 700),
  lookup: clampInt(process.env.MAX_TOKENS_LOOKUP, 64, 1000, 350),
  // Large JSON packs need headroom or responses truncate → empty pack
  daily: clampInt(process.env.MAX_TOKENS_DAILY, 128, 8000, 4000),
  weekly: clampInt(process.env.MAX_TOKENS_WEEKLY, 128, 8000, 4000),
}

const KIND_DAY_KEY = {
  tutor: 'tutor_day',
  lookup: 'lookup_day',
  daily: 'daily_day',
  weekly: 'weekly_day',
}

const inFlight = new Map()

function loadEnvFile(file) {
  try {
    if (!fs.existsSync(file)) return
    const text = fs.readFileSync(file, 'utf8')
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i < 0) continue
      const k = t.slice(0, i).trim()
      let v = t.slice(i + 1).trim()
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1)
      }
      if (!(k in process.env)) process.env[k] = v
    }
  } catch {
    /* ignore */
  }
}

function clientIp(req) {
  const xf = req.headers['x-forwarded-for']
  if (typeof xf === 'string' && xf.trim()) return xf.split(',')[0].trim()
  const real = req.headers['x-real-ip']
  if (typeof real === 'string' && real.trim()) return real.trim()
  return req.socket.remoteAddress || 'unknown'
}

function requestOrigin(req) {
  const o = req.headers.origin
  if (typeof o === 'string' && o.trim()) return o.trim()
  const ref = req.headers.referer
  if (typeof ref === 'string' && ref.trim()) {
    try {
      return new URL(ref).origin
    } catch {
      return ''
    }
  }
  return ''
}

function setCors(res, req) {
  const origin = requestOrigin(req)
  if (ORIGIN_CFG.any) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
  } else if (origin && originAllowed(origin, ORIGIN_CFG)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Access-Code, X-Client-Id, X-App-Token',
  )
  res.setHeader('Access-Control-Max-Age', '86400')
  res.setHeader('X-Content-Type-Options', 'nosniff')
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

function readBody(req, maxBytes = 96_000) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > maxBytes) {
        reject(Object.assign(new Error('Payload too large'), { status: 413 }))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { status: 400 }))
      }
    })
    req.on('error', reject)
  })
}

function checkOriginGate(req) {
  if (ORIGIN_CFG.any) return { ok: true }
  const origin = requestOrigin(req)
  // Allow same-host requests with no Origin (SERVE_STATIC / health checks)
  if (!origin) {
    const host = req.headers.host
    if (host && SERVE_STATIC) return { ok: true }
    // Non-browser clients without Origin blocked when allowlist is set
    return { ok: false, error: 'Origin required' }
  }
  if (!originAllowed(origin, ORIGIN_CFG)) {
    return { ok: false, error: 'Origin not allowed' }
  }
  return { ok: true }
}

function checkAccess(req) {
  if (PROXY_APP_TOKEN) {
    const tok = String(req.headers['x-app-token'] || '').trim()
    if (!safeEqual(tok, PROXY_APP_TOKEN)) {
      return { ok: false, error: 'Invalid app token' }
    }
  }
  if (SOFT_LAUNCH_CODE) {
    const code = String(req.headers['x-access-code'] || '').trim()
    if (!safeEqual(code, SOFT_LAUNCH_CODE)) {
      return { ok: false, error: 'Invalid or missing soft-launch access code' }
    }
  }
  return { ok: true }
}

function checkRates(ip, clientId, kind) {
  // Primary: IP (client-id alone is forgeable)
  const checks = [
    take(`m:ip:${ip}`, LIMITS.minute, 60 * 1000),
    take(`h:ip:${ip}`, LIMITS.hour, 60 * 60 * 1000),
    take(`d:ip:${ip}`, LIMITS.day, 24 * 60 * 60 * 1000),
    take(`g:day`, LIMITS.global_day, 24 * 60 * 60 * 1000),
  ]
  const kindLimitKey = KIND_DAY_KEY[kind]
  if (kindLimitKey) {
    checks.push(
      take(`k:${kind}:ip:${ip}`, LIMITS[kindLimitKey], 24 * 60 * 60 * 1000),
    )
  }
  // Secondary: client id (slows multi-tab abuse a bit)
  if (clientId && clientId !== 'anon') {
    checks.push(take(`d:cid:${clientId}`, LIMITS.day, 24 * 60 * 60 * 1000))
  }

  for (const c of checks) {
    if (!c.ok) {
      return {
        ok: false,
        retryAfterSec: c.retryAfterSec,
        error: 'Rate limit exceeded — နောက်မှ ထပ်ကြိုးစားပါ',
      }
    }
  }
  return { ok: true }
}

function acquireConcurrency(ip) {
  const n = inFlight.get(ip) || 0
  if (n >= LIMITS.concurrent_ip) {
    return { ok: false, error: 'Too many concurrent requests' }
  }
  inFlight.set(ip, n + 1)
  return { ok: true }
}

function releaseConcurrency(ip) {
  const n = inFlight.get(ip) || 0
  if (n <= 1) inFlight.delete(ip)
  else inFlight.set(ip, n - 1)
}

function sanitizeMessages(messages, kind) {
  if (!Array.isArray(messages) || !messages.length) {
    const err = new Error('messages required')
    err.status = 400
    throw err
  }
  const maxMsgs = kind === 'tutor' ? 16 : 6
  if (messages.length > maxMsgs) {
    const err = new Error('Too many messages')
    err.status = 400
    throw err
  }

  const maxContent = kind === 'lookup' ? 4_000 : kind === 'tutor' ? 8_000 : 16_000
  let total = 0
  const out = []
  for (const m of messages) {
    const role =
      m?.role === 'assistant'
        ? 'assistant'
        : m?.role === 'system'
          ? 'system'
          : 'user'
    const content = String(m?.content ?? '')
    total += content.length
    if (total > maxContent * 2) {
      const err = new Error('Messages too large')
      err.status = 413
      throw err
    }
    out.push({ role, content: content.slice(0, maxContent) })
  }
  return out
}

async function proxyChat(body, kind) {
  if (!OPENAI_API_KEY) {
    const err = new Error('AI temporarily unavailable')
    err.status = 503
    throw err
  }

  const messages = sanitizeMessages(body.messages, kind)
  const temperature =
    typeof body.temperature === 'number' && Number.isFinite(body.temperature)
      ? Math.min(1, Math.max(0, body.temperature))
      : 0.4

  const payload = {
    model: OPENAI_MODEL, // ignore client model — cost protection
    temperature,
    max_tokens: MAX_TOKENS[kind] || MAX_TOKENS.tutor,
    messages,
  }

  if (body.response_format?.type === 'json_object') {
    payload.response_format = { type: 'json_object' }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 90_000)

  let upstream
  try {
    upstream = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch (e) {
    clearTimeout(timer)
    const err = new Error(
      e?.name === 'AbortError' ? 'AI timeout' : 'AI upstream unreachable',
    )
    err.status = 504
    throw err
  }
  clearTimeout(timer)

  const text = await upstream.text()
  if (!upstream.ok) {
    // Never forward raw vendor body (may include account hints)
    const err = new Error(
      upstream.status === 429
        ? 'AI provider rate limit — ခဏနေမှ ထပ်ကြိုးစားပါ'
        : 'AI upstream error',
    )
    err.status = upstream.status === 429 ? 429 : 502
    throw err
  }

  let data
  try {
    data = JSON.parse(text)
  } catch {
    const err = new Error('AI upstream error')
    err.status = 502
    throw err
  }

  // Return only what the client needs — drop usage/id noise if desired
  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    const err = new Error('Empty AI response')
    err.status = 502
    throw err
  }
  return {
    choices: [{ message: { role: 'assistant', content } }],
  }
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return (
    {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.ico': 'image/x-icon',
      '.woff2': 'font/woff2',
    }[ext] || 'application/octet-stream'
  )
}

function tryStatic(req, res) {
  if (!SERVE_STATIC || !fs.existsSync(DIST)) return false
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  if (urlPath === '/') urlPath = '/index.html'
  const filePath = path.normalize(path.join(DIST, urlPath))
  if (!filePath.startsWith(DIST)) {
    sendJson(res, 403, { error: 'Forbidden' })
    return true
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, {
      'Content-Type': contentType(filePath),
      'X-Content-Type-Options': 'nosniff',
    })
    fs.createReadStream(filePath).pipe(res)
    return true
  }
  const index = path.join(DIST, 'index.html')
  if (fs.existsSync(index)) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    })
    fs.createReadStream(index).pipe(res)
    return true
  }
  return false
}

const server = http.createServer(async (req, res) => {
  setCors(res, req)
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const ip = clientIp(req)

  try {
    if (req.method === 'GET' && url.pathname === '/api/ai/health') {
      const originGate = checkOriginGate(req)
      if (!originGate.ok) {
        sendJson(res, 403, { ok: false, error: originGate.error })
        return
      }
      const access = checkAccess(req)
      // Minimal disclosure — never expose key/model details
      sendJson(res, access.ok ? 200 : 401, {
        ok: access.ok,
        proxy: true,
        softLaunch: !!SOFT_LAUNCH_CODE,
        error: access.ok ? undefined : access.error,
      })
      return
    }

    // ——— Cloud auth + profile sync ———
    if (req.method === 'GET' && url.pathname === '/api/auth/status') {
      sendJson(res, 200, {
        ok: true,
        google: cloudAuthEnabled(),
        clientId: cloudAuthEnabled() ? getGoogleClientId() : '',
      })
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/google') {
      if (!cloudAuthEnabled()) {
        sendJson(res, 503, { error: 'Google login not configured on server' })
        return
      }
      const body = await readBody(req, 16_000)
      const idToken = String(body.idToken || body.credential || '').trim()
      if (!idToken) {
        sendJson(res, 400, { error: 'idToken required' })
        return
      }
      const googleUser = await verifyGoogleIdToken(idToken)
      const token = signSession(googleUser)
      const existing = readCloudProfile(googleUser.sub)
      sendJson(res, 200, {
        token,
        user: {
          sub: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        },
        hasCloudProfile: !!existing?.profile,
        cloudUpdatedAt: existing?.updatedAt || null,
      })
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/me/profile') {
      const user = bearerUser(req)
      if (!user) {
        sendJson(res, 401, { error: 'Login required' })
        return
      }
      const row = readCloudProfile(user.sub)
      if (!row?.profile) {
        sendJson(res, 404, { error: 'No cloud profile yet', user })
        return
      }
      sendJson(res, 200, {
        user: {
          sub: row.sub,
          email: row.email,
          name: row.name,
          picture: row.picture,
        },
        updatedAt: row.updatedAt,
        profile: row.profile,
      })
      return
    }

    if (req.method === 'PUT' && url.pathname === '/api/me/profile') {
      const user = bearerUser(req)
      if (!user) {
        sendJson(res, 401, { error: 'Login required' })
        return
      }
      // Profiles can be large (attempts, vocab, AI packs)
      const body = await readBody(req, 2_500_000)
      const profile = body.profile
      if (!profile || typeof profile !== 'object') {
        sendJson(res, 400, { error: 'profile object required' })
        return
      }
      // Never store personal API keys in cloud
      if (profile.tutorSettings && typeof profile.tutorSettings === 'object') {
        profile.tutorSettings = {
          ...profile.tutorSettings,
          apiKey: '',
        }
      }
      const saved = writeCloudProfile(user.sub, user, profile)
      sendJson(res, 200, {
        ok: true,
        updatedAt: saved.updatedAt,
      })
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/ai/chat') {
      const originGate = checkOriginGate(req)
      if (!originGate.ok) {
        sendJson(res, 403, { error: originGate.error })
        return
      }
      const access = checkAccess(req)
      if (!access.ok) {
        sendJson(res, 401, { error: access.error })
        return
      }

      const body = await readBody(req)
      const kind = ['tutor', 'lookup', 'daily', 'weekly'].includes(body.kind)
        ? body.kind
        : 'tutor'
      const clientId = String(req.headers['x-client-id'] || '')
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 64)

      const rate = checkRates(ip, clientId, kind)
      if (!rate.ok) {
        res.setHeader('Retry-After', String(rate.retryAfterSec || 60))
        sendJson(res, 429, {
          error: rate.error,
          retryAfterSec: rate.retryAfterSec,
        })
        return
      }

      const slot = acquireConcurrency(ip)
      if (!slot.ok) {
        sendJson(res, 429, { error: slot.error, retryAfterSec: 5 })
        return
      }

      try {
        const data = await proxyChat(body, kind)
        sendJson(res, 200, data)
      } finally {
        releaseConcurrency(ip)
      }
      return
    }

    if (url.pathname.startsWith('/api/')) {
      sendJson(res, 404, { error: 'Not found' })
      return
    }

    if (tryStatic(req, res)) return

    sendJson(res, 404, { error: 'Not found' })
  } catch (e) {
    const status =
      e?.status ||
      (e?.message === 'Payload too large'
        ? 413
        : e?.message === 'Invalid JSON'
          ? 400
          : 500)
    sendJson(res, status, { error: publicError(e, status) })
  }
})

server.listen(PORT, () => {
  console.log(`[path-to-c2] hardened AI proxy :${PORT}`)
  console.log(`  key: ${OPENAI_API_KEY ? 'set (hidden)' : 'MISSING'}`)
  console.log(`  model: ${OPENAI_MODEL} (server-locked)`)
  console.log(`  origins: ${ORIGIN_CFG.any ? '* (set CORS_ORIGIN in prod!)' : ORIGIN_CFG.list.join(', ')}`)
  console.log(`  app token: ${PROXY_APP_TOKEN ? 'required' : 'off'}`)
  console.log(`  invite: ${SOFT_LAUNCH_CODE ? 'required' : 'off'}`)
  console.log(
    `  google sync: ${cloudAuthEnabled() ? 'ON' : 'off (set GOOGLE_CLIENT_ID)'}`,
  )
  console.log(
    `  limits: ${LIMITS.minute}/min ${LIMITS.hour}/hr ${LIMITS.day}/day/ip · global ${LIMITS.global_day}/day`,
  )
})
