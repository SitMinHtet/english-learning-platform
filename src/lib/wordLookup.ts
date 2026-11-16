import type { TutorSettings } from '../types'
import {
  canUseAiLookup,
  chatCompletions,
  extractJsonObject,
} from './aiClient'

export { canUseAiLookup }

export type WordSense = {
  word: string
  meaningMy: string
  pos?: string
  example?: string
  exampleMy?: string
  tipMy?: string
  source: 'ai' | 'offline'
}

const SKIP = new Set([
  'a',
  'an',
  'the',
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'me',
  'him',
  'her',
  'us',
  'them',
  'my',
  'your',
  'his',
  'its',
  'our',
  'their',
  'is',
  'am',
  'are',
  'was',
  'were',
  'be',
  'been',
  'to',
  'of',
  'in',
  'on',
  'at',
  'for',
  'and',
  'or',
  'but',
  'if',
  'as',
  'by',
  'with',
  'from',
  'this',
  'that',
  'these',
  'those',
  'not',
  'do',
  'does',
  'did',
  'will',
  'would',
  'can',
  'could',
  'should',
  'may',
  'might',
  'must',
  'have',
  'has',
  'had',
])

const cache = new Map<string, WordSense>()

export function normalizeLemma(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^[^a-z]+|[^a-z]+$/gi, '')
    .trim()
}

export function isSkippableWord(word: string): boolean {
  const w = normalizeLemma(word)
  if (!w || w.length <= 1) return true
  if (/^_+$/.test(word.trim())) return true
  return SKIP.has(w)
}

function cacheKey(word: string, context: string): string {
  return `${normalizeLemma(word)}::${context.slice(0, 80)}`
}

function offlineSense(word: string): WordSense {
  const w = normalizeLemma(word)
  return {
    word: w,
    meaningMy:
      'AI proxy မရပါ — အင်တာနက် / server ကို စစ်ပြီး ပြန်နှိပ်ပါ။',
    tipMy: 'Public soft-launch တွင် owner proxy မှ AI အဓိပ္ပာယ် ရှာသည်။',
    source: 'offline',
  }
}

/**
 * Look up a word with AI via public proxy (or advanced own key).
 */
export async function lookupWordAi(
  raw: string,
  context: string,
  settings: TutorSettings | null | undefined,
): Promise<WordSense> {
  const word = normalizeLemma(raw)
  if (!word) {
    return {
      word: raw,
      meaningMy: 'စကားလုံး မမှန်ပါ',
      source: 'offline',
    }
  }

  const key = cacheKey(word, context)
  const cached = cache.get(key)
  if (cached) return cached

  if (!canUseAiLookup(settings)) {
    const miss = offlineSense(word)
    return miss
  }

  const system = `You are an English teacher for Myanmar (Burmese) learners.
Languages: Myanmar for meanings/tips; English for the headword and example sentence only.
Never use any other language.
Return ONLY valid JSON.`

  const user = `Explain this English word for a learner.

Word: "${word}"
Sentence context: "${context.slice(0, 280)}"

JSON shape:
{
  "word": "lemma form",
  "pos": "verb|noun|adj|...",
  "meaningMy": "မြန်မာ အဓိပ္ပာယ် (ဤဝါကျအရ)",
  "example": "one short English example",
  "exampleMy": "ဥပမာ၏ မြန်မာ ဘာသာပြန်",
  "tipMy": "သဒ္ဒါ/အသုံး တစ်ကြောင်း (optional)"
}`

  try {
    let raw: string
    try {
      raw = await chatCompletions({
        kind: 'lookup',
        settings: settings!,
        temperature: 0.2,
        responseFormatJson: true,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      })
    } catch {
      raw = await chatCompletions({
        kind: 'lookup',
        settings: settings!,
        temperature: 0.2,
        messages: [
          { role: 'system', content: `${system}\nReturn ONLY valid JSON.` },
          { role: 'user', content: user },
        ],
      })
    }
    const obj = extractJsonObject(raw) as Record<string, unknown>
    const sense: WordSense = {
      word: String(obj.word || word),
      meaningMy: String(obj.meaningMy || '').trim() || 'အဓိပ္ပာယ် မရပါ',
      pos: obj.pos ? String(obj.pos) : undefined,
      example: obj.example ? String(obj.example) : undefined,
      exampleMy: obj.exampleMy ? String(obj.exampleMy) : undefined,
      tipMy: obj.tipMy ? String(obj.tipMy) : undefined,
      source: 'ai',
    }
    cache.set(key, sense)
    return sense
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'AI error'
    return {
      word,
      meaningMy: `AI ရှာမရပါ (${msg})`,
      tipMy: 'AI proxy / အင်တာနက် / rate limit ကို စစ်ပါ။',
      source: 'offline',
    }
  }
}
