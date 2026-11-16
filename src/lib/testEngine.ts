import { QUESTIONS } from '../data/questions'
import { LEVELS, LEVEL_ORDER, emptySkillScores, levelFromScore } from '../data/cefr'
import type {
  CEFRLevel,
  LevelTestResult,
  Question,
  Skill,
  SkillScores,
  UserProfile,
} from '../types'

const SKILLS: Skill[] = [
  'listening',
  'speaking',
  'reading',
  'writing',
  'pronunciation',
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Level tests need objective scoring — prefer items with options */
function isTestFriendly(q: Question): boolean {
  return Array.isArray(q.options) && q.options.length >= 2
}

/** Never reuse IDs already in usedQuestionIds; expand pool if needed */
export function pickUniqueQuestions(
  usedIds: string[],
  count: number,
  preferLevels?: CEFRLevel[],
): Question[] {
  const used = new Set(usedIds)
  let pool = QUESTIONS.filter((q) => !used.has(q.id) && isTestFriendly(q))

  if (preferLevels?.length) {
    // Stay inside the preferred band only (no distant-level spill)
    pool = shuffle(pool.filter((q) => preferLevels.includes(q.level)))
  } else {
    pool = shuffle(pool)
  }

  const picked: Question[] = []
  const perSkill = Math.max(1, Math.floor(count / SKILLS.length))

  for (const skill of SKILLS) {
    const fromSkill = pool.filter((q) => q.skill === skill && !picked.includes(q))
    picked.push(...fromSkill.slice(0, perSkill))
  }

  for (const q of pool) {
    if (picked.length >= count) break
    if (!picked.find((p) => p.id === q.id)) picked.push(q)
  }

  const bandOk = (q: Question) =>
    !preferLevels?.length || preferLevels.includes(q.level)

  // Bank exhausted: reuse MCQs only within band
  if (picked.length < count) {
    const fill = shuffle(
      QUESTIONS.filter(
        (q) =>
          isTestFriendly(q) &&
          bandOk(q) &&
          !picked.find((p) => p.id === q.id),
      ),
    )
    picked.push(...fill.slice(0, count - picked.length))
  }

  // Still short: controlled reuse of already-used MCQs in band
  if (picked.length < count) {
    const reuse = shuffle(QUESTIONS.filter((q) => isTestFriendly(q) && bandOk(q)))
    for (const q of reuse) {
      if (picked.length >= count) break
      if (!picked.find((p) => p.id === q.id)) picked.push(q)
    }
  }

  return shuffle(picked).slice(0, count)
}

export function buildPlacementTest(usedIds: string[]): Question[] {
  const picked: Question[] = []
  const used = new Set(usedIds)
  for (const level of LEVELS) {
    const pool = shuffle(
      QUESTIONS.filter(
        (q) => q.level === level && !used.has(q.id) && isTestFriendly(q),
      ),
    )
    picked.push(...pool.slice(0, 3))
  }
  if (picked.length < 15) {
    picked.push(
      ...pickUniqueQuestions(
        [...usedIds, ...picked.map((p) => p.id)],
        15 - picked.length,
      ),
    )
  }
  return shuffle(picked).slice(0, 18)
}

export function buildWeeklyTest(profile: UserProfile): Question[] {
  const ai = profile.weeklyAiPack
  if (
    ai?.source === 'ai' &&
    ai.level === profile.currentLevel &&
    Array.isArray(ai.questions) &&
    ai.questions.length >= 8
  ) {
    return ai.questions.filter(
      (q) => Array.isArray(q.options) && q.options.length >= 2,
    )
  }
  const level = profile.currentLevel
  const order = LEVEL_ORDER[level]
  const nearby = LEVELS.filter((l) => Math.abs(LEVEL_ORDER[l] - order) <= 1)
  return pickUniqueQuestions(profile.usedQuestionIds, 15, nearby)
}

export function scoreTest(
  questions: Question[],
  answers: Record<string, string>,
  kind: 'placement' | 'weekly',
): LevelTestResult {
  const skillScores = emptySkillScores(0)
  const skillTotals = emptySkillScores(0)
  let correct = 0

  for (const q of questions) {
    skillTotals[q.skill] += 1
    const user = (answers[q.id] ?? '').trim()
    const ok = isAnswerCorrect(q, user)
    if (ok) {
      correct++
      skillScores[q.skill] += 1
    }
  }

  const percent = Math.round((correct / Math.max(questions.length, 1)) * 100)
  const normalized: SkillScores = emptySkillScores(0)
  for (const s of SKILLS) {
    // Untested skills: keep sentinel -1 so mergeMastery leaves prior mastery alone
    normalized[s] =
      skillTotals[s] > 0
        ? Math.round((skillScores[s] / skillTotals[s]) * 100)
        : -1
  }

  return {
    id: `test-${Date.now()}`,
    kind,
    date: new Date().toISOString(),
    level: levelFromScore(percent),
    percent,
    skillScores: normalized,
    questionIds: questions.map((q) => q.id),
  }
}

function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Stable shuffle so correct answers are not always in the same slot */
export function shuffleOptions<T>(items: T[], seed: string): T[] {
  const a = [...items]
  let state = hashSeed(seed)
  const rnd = () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Copy question with shuffled options (answer string unchanged) */
export function withShuffledOptions(q: Question, salt = ''): Question {
  if (!q.options || q.options.length < 2) return q
  return {
    ...q,
    options: shuffleOptions(q.options, `${q.id}:${salt}`),
  }
}

export function isAnswerCorrect(q: Question, userAnswer: string): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()

  const u = normalize(userAnswer)
  if (!u) return false
  if (Array.isArray(q.answer)) {
    return q.answer.some((a) => normalize(a) === u)
  }
  return normalize(q.answer) === u
}

/** Story quiz helper (same normalize rules) */
export function isOptionCorrect(answer: string, userAnswer: string): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
  return normalize(answer) === normalize(userAnswer)
}

export function mergeMastery(
  current: SkillScores,
  testScores: SkillScores,
  weight = 0.35,
): SkillScores {
  const out = emptySkillScores(0)
  for (const s of SKILLS) {
    if (testScores[s] < 0) {
      out[s] = current[s]
    } else {
      out[s] = Math.round(current[s] * (1 - weight) + testScores[s] * weight)
    }
  }
  return out
}

export function averageMastery(m: SkillScores): number {
  const vals = SKILLS.map((s) => m[s]).filter((v) => v >= 0)
  if (vals.length === 0) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}
