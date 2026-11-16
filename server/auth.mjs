/**
 * Google ID token verify + HMAC session JWT (no extra npm deps).
 */
import crypto from 'node:crypto'

const SESSION_TTL_SEC = 60 * 60 * 24 * 30 // 30 days

function b64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function b64urlJson(obj) {
  return b64url(JSON.stringify(obj))
}

function fromB64url(s) {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(b64, 'base64').toString('utf8')
}

export function getSessionSecret() {
  const s = (process.env.SESSION_SECRET || '').trim()
  if (s) return s
  // Dev fallback — set SESSION_SECRET in production
  return 'path-to-c2-dev-session-change-me'
}

export function getGoogleClientId() {
  return (process.env.GOOGLE_CLIENT_ID || '').trim()
}

export function cloudAuthEnabled() {
  return !!getGoogleClientId()
}

/** Verify Google GIS credential (JWT) via tokeninfo */
export async function verifyGoogleIdToken(idToken) {
  const clientId = getGoogleClientId()
  if (!clientId) {
    const err = new Error('Google login not configured')
    err.status = 503
    throw err
  }
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  const res = await fetch(url)
  if (!res.ok) {
    const err = new Error('Invalid Google token')
    err.status = 401
    throw err
  }
  const data = await res.json()
  if (data.aud !== clientId) {
    const err = new Error('Google token audience mismatch')
    err.status = 401
    throw err
  }
  const exp = Number(data.exp)
  if (Number.isFinite(exp) && exp * 1000 < Date.now()) {
    const err = new Error('Google token expired')
    err.status = 401
    throw err
  }
  if (!data.sub) {
    const err = new Error('Google token missing sub')
    err.status = 401
    throw err
  }
  return {
    sub: String(data.sub),
    email: data.email ? String(data.email) : '',
    name: data.name ? String(data.name) : '',
    picture: data.picture ? String(data.picture) : '',
    emailVerified: data.email_verified === 'true' || data.email_verified === true,
  }
}

export function signSession(user) {
  const header = b64urlJson({ alg: 'HS256', typ: 'JWT' })
  const now = Math.floor(Date.now() / 1000)
  const payload = b64urlJson({
    sub: user.sub,
    email: user.email || '',
    name: user.name || '',
    picture: user.picture || '',
    iat: now,
    exp: now + SESSION_TTL_SEC,
  })
  const data = `${header}.${payload}`
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `${data}.${sig}`
}

export function verifySession(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, payload, sig] = parts
  const data = `${header}.${payload}`
  const expected = crypto
    .createHmac('sha256', getSessionSecret())
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const body = JSON.parse(fromB64url(payload))
    if (!body.sub || (body.exp && body.exp < Math.floor(Date.now() / 1000))) {
      return null
    }
    return {
      sub: String(body.sub),
      email: String(body.email || ''),
      name: String(body.name || ''),
      picture: String(body.picture || ''),
    }
  } catch {
    return null
  }
}

export function bearerUser(req) {
  const h = req.headers.authorization || ''
  const m = /^Bearer\s+(.+)$/i.exec(h)
  if (!m) return null
  return verifySession(m[1].trim())
}
