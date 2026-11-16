/**
 * Reshuffle MCQ options in data files so the correct answer
 * is not stuck in position 2. Keeps `answer` string unchanged.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

function hash(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle(arr, seed) {
  const a = [...arr]
  const rnd = mulberry32(hash(seed))
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function shuffleOptionsLiteral(optionsLit, seed) {
  let options
  try {
    options = eval(optionsLit)
  } catch {
    return null
  }
  if (!Array.isArray(options) || options.length < 2) return null
  const shuffled = seededShuffle(options, seed)
  // Avoid no-op shuffle when already biased — force at least one swap if possible
  if (shuffled.every((v, i) => v === options[i]) && options.length > 1) {
    ;[shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
  }
  return `[${shuffled.map((o) => JSON.stringify(o)).join(', ')}]`
}

const files = [
  'src/data/questions.ts',
  'src/data/questionsExtra.ts',
  'src/data/questionsBatch3.ts',
  'src/data/stories.ts',
]

let changed = 0
for (const file of files) {
  let text = readFileSync(file, 'utf8')
  let n = 0
  text = text.replace(
    /options:\s*(\[[^\]]*\])/g,
    (full, lit, offset) => {
      // Find nearby id for seed
      const before = text.slice(Math.max(0, offset - 200), offset)
      const idMatch = before.match(/id:\s*'([^']+)'[^]*$/)
      const seed = `${file}:${idMatch?.[1] ?? n}:${lit}`
      const next = shuffleOptionsLiteral(lit, seed)
      if (!next || next === lit) return full
      n++
      changed++
      return `options: ${next}`
    },
  )
  writeFileSync(file, text)
  console.log(file, 'blocks', n)
}
console.log('total changed', changed)
