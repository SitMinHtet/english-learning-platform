/** Browser Web Speech helpers for listening / speaking / pronunciation */

let voicesReady: Promise<void> | null = null

function ensureVoices(): Promise<void> {
  if (!window.speechSynthesis) return Promise.resolve()
  if (window.speechSynthesis.getVoices().length > 0) return Promise.resolve()
  if (voicesReady) return voicesReady
  voicesReady = new Promise((resolve) => {
    const done = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', done)
      resolve()
    }
    window.speechSynthesis.addEventListener('voiceschanged', done)
    window.setTimeout(done, 500)
  })
  return voicesReady
}

export async function speak(text: string, rate = 0.9): Promise<void> {
  if (!window.speechSynthesis) {
    throw new Error('Speech synthesis not supported')
  }
  await ensureVoices()
  window.speechSynthesis.cancel()
  try {
    window.speechSynthesis.resume()
  } catch {
    /* ignore */
  }

  return new Promise((resolve, reject) => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = rate
    const voices = window.speechSynthesis.getVoices()
    const en =
      voices.find((v) => v.lang === 'en-US') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('en'))
    if (en) u.voice = en

    let settled = false
    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(watchdog)
      fn()
    }

    const watchdog = window.setTimeout(
      () => finish(() => resolve()),
      Math.max(4000, text.length * 120),
    )

    u.onend = () => finish(() => resolve())
    u.onerror = () =>
      finish(() =>
        reject(new Error('အသံဖွင့် မရပါ — speaker / Windows voice စစ်ပါ')),
      )

    window.speechSynthesis.speak(u)
    window.setTimeout(() => {
      try {
        window.speechSynthesis.resume()
      } catch {
        /* ignore */
      }
    }, 50)
  })
}

export function stopSpeaking(): void {
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* ignore */
  }
}

export function isSpeechRecognitionAvailable(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

function SpeechRecognitionCtor(): (new () => SpeechRecognition) | null {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function recognitionErrorMessage(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'မိုက်ခရိုဖုန်း ခွင့်မပြုရသေးပါ — address bar 🔒/🎤 → Allow'
    case 'audio-capture':
      return 'မိုက် ဖွင့်မရပါ — Windows Sound > Input မှာ default mic စစ်ပါ'
    case 'no-speech':
      return 'အသံ မကြားရပါ — အနီးကပ် ကျယ်ကျယ်ပြောပါ'
    case 'aborted':
      return 'အသံဖမ်း ရပ်သွားသည်'
    case 'network':
      return 'Chrome speech အတွက် အင်တာနက် လိုသည် — ချိတ်ဆက်ပြီး ထပ်စမ်းပါ'
    default:
      return `အသံ ဖမ်းမရပါ (${code || 'unknown'})`
  }
}

export type ListenHandle = {
  stop: () => void
}

export type ListenOptions = {
  timeoutMs?: number
  onPartial?: (text: string) => void
  onLevel?: (level: number) => void
  onReady?: (handle: ListenHandle) => void
}

async function openMic(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('ဤဘရောက်ဇာတွင် မိုက် မပံ့ပိုးပါ — Chrome သုံးပါ')
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    })
  } catch (err) {
    const name = err instanceof DOMException ? err.name : ''
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      throw new Error('မိုက်ခရိုဖုန်း ခွင့်မပြုရသေးပါ — Allow လုပ်ပါ')
    }
    if (name === 'NotFoundError') {
      throw new Error('မိုက်ခရိုဖုန်း မတွေ့ပါ')
    }
    if (name === 'NotReadableError') {
      throw new Error('မိုက်ကို အခြား app က သုံးနေသည် — Teams/Zoom ပိတ်ပါ')
    }
    throw new Error('မိုက်ခရိုဖုန်း ဖွင့်မရပါ')
  }
}

function startLevelMeter(
  stream: MediaStream,
  onLevel?: (n: number) => void,
): () => void {
  if (!onLevel) return () => undefined
  let ctx: AudioContext | null = null
  let raf = 0
  try {
    ctx = new AudioContext()
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)
    const tick = () => {
      analyser.getByteFrequencyData(data)
      let sum = 0
      for (let i = 0; i < data.length; i++) sum += data[i] ?? 0
      const avg = sum / Math.max(1, data.length)
      onLevel(Math.min(100, Math.round((avg / 48) * 100)))
      raf = requestAnimationFrame(tick)
    }
    void ctx.resume()
    raf = requestAnimationFrame(tick)
  } catch {
    /* meter optional */
  }
  return () => {
    cancelAnimationFrame(raf)
    void ctx?.close()
  }
}

type ShotStatus = 'result' | 'empty' | 'fatal'

/**
 * Listen for English speech.
 * Keeps mic open for level meter; restarts SpeechRecognition until text or timeout.
 */
export async function listenOnce(
  timeoutMsOrOpts: number | ListenOptions = 20000,
): Promise<string> {
  const opts: ListenOptions =
    typeof timeoutMsOrOpts === 'number'
      ? { timeoutMs: timeoutMsOrOpts }
      : timeoutMsOrOpts
  const timeoutMs = opts.timeoutMs ?? 20000

  stopSpeaking()
  await new Promise((r) => setTimeout(r, 200))

  const Ctor = SpeechRecognitionCtor()
  if (!Ctor) {
    throw new Error('Speech recognition မရပါ — Chrome သို့ Edge သုံးပါ')
  }

  // 1) Prove mic works + show level, then RELEASE so SpeechRecognition can own the device
  const stream = await openMic()
  const stopMeter = startLevelMeter(stream, opts.onLevel)
  await new Promise((r) => setTimeout(r, 700))
  stopMeter()
  for (const t of stream.getTracks()) t.stop()
  opts.onLevel?.(0)
  await new Promise((r) => setTimeout(r, 250))

  let stoppedByUser = false
  let best = ''
  let fatalMsg = ''
  let activeRec: SpeechRecognition | null = null
  // Soft “listening” pulse while recognition runs (no exclusive mic hold)
  const pulse = window.setInterval(() => {
    opts.onLevel?.(35 + Math.round(Math.random() * 40))
  }, 200)

  const publish = (t: string) => {
    if (!t) return
    best = t
    opts.onPartial?.(t)
    opts.onLevel?.(85)
  }

  opts.onReady?.({
    stop: () => {
      stoppedByUser = true
      try {
        activeRec?.stop()
      } catch {
        /* ignore */
      }
    },
  })

  const oneShot = (): Promise<ShotStatus> =>
    new Promise((resolve) => {
      const rec = new Ctor()
      activeRec = rec
      rec.lang = 'en-US'
      rec.interimResults = true
      rec.continuous = false
      rec.maxAlternatives = 3

      let got = ''
      let finished = false
      const end = (status: ShotStatus) => {
        if (finished) return
        finished = true
        activeRec = null
        resolve(status)
      }

      rec.onresult = (ev: SpeechRecognitionEvent) => {
        let finals = ''
        let interim = ''
        for (let i = 0; i < ev.results.length; i++) {
          const piece = ev.results[i]?.[0]?.transcript ?? ''
          if (ev.results[i]?.isFinal) finals += `${piece} `
          else interim += piece
        }
        got = (finals || interim).trim()
        if (got) publish(got)
      }

      rec.onerror = (ev: SpeechRecognitionErrorEvent) => {
        const code = ev.error || 'unknown'
        if (code === 'aborted' || code === 'no-speech') {
          end(got ? 'result' : 'empty')
          return
        }
        if (
          code === 'network' ||
          code === 'not-allowed' ||
          code === 'service-not-allowed' ||
          code === 'audio-capture'
        ) {
          fatalMsg = recognitionErrorMessage(code)
          end(got ? 'result' : 'fatal')
          return
        }
        end(got ? 'result' : 'empty')
      }

      rec.onend = () => {
        end(got ? 'result' : 'empty')
      }

      try {
        rec.start()
      } catch {
        end('empty')
      }
    })

  const deadline = Date.now() + timeoutMs

  try {
    while (Date.now() < deadline && !stoppedByUser) {
      const status = await oneShot()
      if (best.trim()) break
      if (status === 'fatal') break
      await new Promise((r) => setTimeout(r, 220))
    }

    const text = best.trim()
    if (text) return text

    if (stoppedByUser) {
      throw new Error('စာသား မရသေးပါ — ထပ်နှိပ်ပြီး ပြောပါ')
    }
    if (fatalMsg) throw new Error(fatalMsg)
    throw new Error(
      'အသံ မရပါ — Chrome + အင်တာနက် လိုသည်။ အောက်က စာရိုက်ပြီးလည်း စစ်နိုင်သည်။',
    )
  } finally {
    clearInterval(pulse)
    try {
      const rec = activeRec as { abort?: () => void; stop?: () => void } | null
      rec?.abort?.() ?? rec?.stop?.()
    } catch {
      /* ignore */
    }
    opts.onLevel?.(0)
  }
}

export function normalizeSpeech(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function scorePronunciation(expected: string, heard: string): number {
  const a = normalizeSpeech(expected).split(' ').filter(Boolean)
  const b = normalizeSpeech(heard).split(' ').filter(Boolean)
  if (a.length === 0) return 0
  if (normalizeSpeech(expected) === normalizeSpeech(heard)) return 100

  let matched = 0
  const used = new Set<number>()
  for (const w of a) {
    const idx = b.findIndex((x, i) => !used.has(i) && (x === w || levenshtein(x, w) <= 1))
    if (idx >= 0) {
      used.add(idx)
      matched++
    }
  }
  const wordScore = (matched / a.length) * 80
  const full = levenshtein(normalizeSpeech(expected), normalizeSpeech(heard))
  const maxLen = Math.max(normalizeSpeech(expected).length, 1)
  const charScore = Math.max(0, 1 - full / maxLen) * 20
  return Math.round(Math.min(100, wordScore + charScore))
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  )
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      )
    }
  }
  return dp[m][n]
}
