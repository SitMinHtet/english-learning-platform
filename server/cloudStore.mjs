/**
 * File-based cloud profile store (no native DB deps).
 * data/cloud/<googleSub>.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data', 'cloud')

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

function userPath(sub) {
  const safe = String(sub).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128)
  if (!safe) throw Object.assign(new Error('Invalid user id'), { status: 400 })
  return path.join(DATA_DIR, `${safe}.json`)
}

/**
 * @returns {{ sub: string, email?: string, name?: string, picture?: string, profile: object, updatedAt: string } | null}
 */
export function readCloudProfile(sub) {
  ensureDir()
  const file = userPath(sub)
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

export function writeCloudProfile(sub, meta, profile) {
  ensureDir()
  const updatedAt =
    (profile && typeof profile.updatedAt === 'string' && profile.updatedAt) ||
    new Date().toISOString()
  const payload = {
    sub,
    email: meta.email || '',
    name: meta.name || '',
    picture: meta.picture || '',
    updatedAt,
    profile,
  }
  const tmp = `${userPath(sub)}.tmp`
  const file = userPath(sub)
  fs.writeFileSync(tmp, JSON.stringify(payload), 'utf8')
  fs.renameSync(tmp, file)
  return payload
}
