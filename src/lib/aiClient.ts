import type { TutorSettings } from '../types'
import {
  aiProxyBase,
  getAccessCode,
  getClientId,
  isAiProxyEnabled,
  proxyAppToken,
  type AiKind,
} from './aiConfig'

export class AiClientError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AiClientError'
    this.status = status
  }
}

export function canUseCloudAi(settings: TutorSettings | null | undefined): boolean {
  if (isAiProxyEnabled()) return true
  return !!settings?.apiKey?.trim()
}

export function canUseAiDaily(settings: TutorSettings | null | undefined): boolean {
  return !!(settings?.useAiDaily && canUseCloudAi(settings))
}

export function canUseAiWeekly(settings: TutorSettings | null | undefined): boolean {
  return canUseCloudAi(settings)
}

export function canUseAiLookup(settings: TutorSettings | null | undefined): boolean {
  return canUseCloudAi(settings)
}

type ChatArgs = {
  kind: AiKind
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  temperature?: number
  responseFormatJson?: boolean
  settings: TutorSettings
}

/**
 * Chat completions via public proxy (preferred) or user's own key (advanced).
 */
export async function chatCompletions(args: ChatArgs): Promise<string> {
  const { kind, messages, temperature = 0.4, responseFormatJson, settings } =
    args

  if (isAiProxyEnabled()) {
    return chatViaProxy({
      kind,
      messages,
      temperature,
      responseFormatJson,
    })
  }

  const key = settings.apiKey?.trim()
  if (!key) throw new AiClientError('API key မရှိပါ', 401)

  const base = settings.baseUrl.replace(/\/$/, '')
  const body: Record<string, unknown> = {
    model: settings.model,
    temperature,
    messages,
  }
  if (responseFormatJson) body.response_format = { type: 'json_object' }

  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new AiClientError(`${res.status}: ${t.slice(0, 160)}`, res.status)
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) throw new AiClientError('Empty AI response')
  return content
}

function proxyHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client-Id': getClientId(),
  }
  const code = getAccessCode()
  if (code) headers['X-Access-Code'] = code
  const appTok = proxyAppToken()
  if (appTok) headers['X-App-Token'] = appTok
  return headers
}

async function chatViaProxy(opts: {
  kind: AiKind
  messages: ChatArgs['messages']
  temperature: number
  responseFormatJson?: boolean
}): Promise<string> {
  const res = await fetch(`${aiProxyBase()}/chat`, {
    method: 'POST',
    headers: proxyHeaders(),
    body: JSON.stringify({
      kind: opts.kind,
      // model is server-locked — never send client model (cost abuse)
      temperature: opts.temperature,
      messages: opts.messages,
      ...(opts.responseFormatJson
        ? { response_format: { type: 'json_object' } }
        : {}),
    }),
  })

  if (!res.ok) {
    let msg = `${res.status}`
    try {
      const j = (await res.json()) as { error?: string; retryAfterSec?: number }
      msg = j.error || msg
      if (res.status === 429 && j.retryAfterSec) {
        msg = `${msg} (${j.retryAfterSec}s)`
      }
    } catch {
      msg = (await res.text()).slice(0, 160) || msg
    }
    throw new AiClientError(msg, res.status)
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) throw new AiClientError('Empty AI response')
  return content
}

export async function checkProxyHealth(): Promise<{
  ok: boolean
  softLaunch: boolean
  hasKey: boolean
  error?: string
}> {
  if (!isAiProxyEnabled()) {
    return { ok: false, softLaunch: false, hasKey: false, error: 'Proxy off' }
  }
  try {
    const res = await fetch(`${aiProxyBase()}/health`, {
      headers: proxyHeaders(),
    })
    const j = (await res.json()) as {
      ok?: boolean
      softLaunch?: boolean
      error?: string
    }
    return {
      ok: !!j.ok && res.ok,
      softLaunch: !!j.softLaunch,
      hasKey: true, // key status intentionally hidden by proxy
      error: j.error,
    }
  } catch {
    return {
      ok: false,
      softLaunch: false,
      hasKey: false,
      error: 'AI proxy မရောက်ပါ — server ဖွင့်ထားကြောင်း စစ်ပါ',
    }
  }
}

export function extractJsonObject(text: string): unknown {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return JSON.parse(text.slice(start, end + 1))
  }
  return JSON.parse(text)
}
