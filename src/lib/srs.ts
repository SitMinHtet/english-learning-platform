import {
  vocabByLevel,
  getVocabWord,
  VOCAB_BANK,
  allVocabWords,
} from '../data/vocab'
import type {
  CEFRLevel,
  VocabCardState,
  VocabWord,
  UserProfile,
} from '../types'
import { isLevelNear, LEVEL_ORDER, levelsNear } from '../data/cefr'

/** SM-2 quality: 0 again, 1 hard, 2 good, 3 easy */
export type SrsQuality = 0 | 1 | 2 | 3

export function newCard(wordId: string): VocabCardState {
  return {
    wordId,
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    due: new Date().toISOString(),
    lapses: 0,
  }
}

export function reviewCard(card: VocabCardState, quality: SrsQuality): VocabCardState {
  let { ease, interval, repetitions, lapses } = card

  if (quality === 0) {
    repetitions = 0
    interval = 0
    lapses += 1
    ease = Math.max(1.3, ease - 0.2)
  } else {
    if (repetitions === 0) {
      // Hard on new cards: short delay (not immediate loop)
      interval = quality === 1 ? 0 : 1
    } else if (repetitions === 1) {
      interval = quality === 1 ? 1 : quality === 2 ? 3 : 4
    } else {
      const mult = quality === 1 ? 1.2 : quality === 2 ? ease : ease * 1.3
      interval = Math.max(1, Math.round(interval * mult))
    }
    repetitions += 1
    ease = Math.max(
      1.3,
      ease + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02)),
    )
  }

  const due = new Date()
  if (quality === 0) {
    due.setTime(Date.now() + 10 * 60 * 1000)
  } else if (quality === 1 && interval === 0) {
    due.setTime(Date.now() + 10 * 60 * 1000)
  } else {
    due.setDate(due.getDate() + Math.max(1, interval))
  }

  return {
    ...card,
    ease: Math.round(ease * 100) / 100,
    interval,
    repetitions,
    lapses,
    lastResult: quality,
    due: due.toISOString(),
  }
}

function cardsOf(profile: UserProfile): VocabCardState[] {
  const raw = profile.vocabCards as unknown
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object' && Array.isArray((raw as { cards?: unknown }).cards)) {
    return (raw as { cards: VocabCardState[] }).cards
  }
  return []
}

export function dueCards(profile: UserProfile): VocabCardState[] {
  const now = Date.now()
  return cardsOf(profile)
    .filter((c) => new Date(c.due).getTime() <= now)
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
}

/**
 * Add up to `count` new cards within current ±1 only
 * (e.g. B1 → A2 / B1 / B2 — never A1 or C1+).
 */
export function ensureVocabDeck(
  profile: UserProfile,
  level: CEFRLevel,
  count = 8,
): { cards: VocabCardState[]; added: number } {
  const existing = cardsOf(profile)
  const have = new Set(existing.map((c) => c.wordId))
  const order = LEVEL_ORDER[level]
  const band = new Set(levelsNear(level, 1))

  const byPriority = (w: VocabWord) => Math.abs(LEVEL_ORDER[w.level] - order)

  const bank = allVocabWords(profile.customVocab ?? []).filter((w) =>
    band.has(w.level),
  )
  const available = bank.filter((w) => !have.has(w.id)).sort((a, b) => {
    const pa = byPriority(a)
    const pb = byPriority(b)
    if (pa !== pb) return pa - pb
    return LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]
  })

  const sameLevel = [
    ...vocabByLevel(level),
    ...(profile.customVocab ?? []).filter((w) => w.level === level),
  ].filter((w) => !have.has(w.id))
  const nearOnly = available.filter((w) => w.level !== level)
  const preferred = [...sameLevel, ...nearOnly]

  const unique: VocabWord[] = []
  const seen = new Set<string>()
  for (const w of preferred) {
    if (seen.has(w.id)) continue
    if (!band.has(w.level)) continue
    seen.add(w.id)
    unique.push(w)
    if (unique.length >= count) break
  }

  const newCards = unique.map((w) => newCard(w.id))
  return {
    cards: [...existing, ...newCards],
    added: newCards.length,
  }
}

/** Due cards whose word is within current ±1 (hide out-of-band leftovers) */
export function dueCardsNearLevel(
  profile: UserProfile,
  level: CEFRLevel,
): VocabCardState[] {
  const extra = profile.customVocab ?? []
  return dueCards(profile).filter((c) => {
    const w = getVocabWord(c.wordId, extra)
    return w ? isLevelNear(w.level, level, 1) : false
  })
}

export function availableNewCount(profile: UserProfile): number {
  const have = new Set(cardsOf(profile).map((c) => c.wordId))
  const band = levelsNear(profile.currentLevel, 1)
  return allVocabWords(profile.customVocab ?? []).filter(
    (w) => !have.has(w.id) && band.includes(w.level),
  ).length
}

export function vocabStats(profile: UserProfile) {
  const list = cardsOf(profile)
  const due = dueCardsNearLevel(profile, profile.currentLevel).length
  const learning = list.filter((c) => c.repetitions < 3).length
  const mastered = list.filter(
    (c) => c.repetitions >= 5 && c.interval >= 21,
  ).length
  return {
    total: list.length,
    due,
    learning,
    mastered,
    remaining: availableNewCount(profile),
    bankSize: allVocabWords(profile.customVocab ?? []).length,
  }
}

export function cardWithWord(card: VocabCardState, extra: VocabWord[] = []) {
  return { card, word: getVocabWord(card.wordId, extra) }
}
