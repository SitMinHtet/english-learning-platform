import { checkWriting } from './writingChecker'
import { LEVEL_LABELS } from '../data/cefr'
import type { ChatMessage, TutorSettings, UserProfile } from '../types'

const SYSTEM_MY = `သင်သည် Path to C2 အင်္ဂလိပ်ဆရာ ဖြစ်သည်။
ဘာသာစကား စည်းမျဉ်း: မြန်မာ နှင့် English သာ သုံးပါ။ အခြား မည်သည့်ဘာသာကိုမျှ မသုံးရ။
မြန်မာလို အဓိက ရှင်းပြပါ။ ဥပမာ/ပစ်မှတ် စကားလုံးများကို အင်္ဂလိပ်လို ပေးပါ။ တိုရှင်း၊ အဆင့်ဆင့် သင်ပေးပါ။`

export async function askTutor(
  userText: string,
  profile: UserProfile,
): Promise<string> {
  const settings = profile.tutorSettings
  if (settings.useCloud && settings.apiKey.trim()) {
    try {
      return await askCloud(userText, profile, settings)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'API error'
      return `⚠️ Cloud tutor မအောင်မြင်ပါ (${msg})။ Offline ဆရာဖြင့် ပြန်ဖြေပါသည်။\n\n${offlineReply(userText, profile)}`
    }
  }
  return offlineReply(userText, profile)
}

async function askCloud(
  userText: string,
  profile: UserProfile,
  settings: TutorSettings,
): Promise<string> {
  const history = profile.tutorChat.slice(-12).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }))

  const res = await fetch(`${settings.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: `${SYSTEM_MY}
Student: ${profile.name}, CEFR ${profile.currentLevel} (${LEVEL_LABELS[profile.currentLevel].my}), target C2.
Reply ONLY in Burmese (Myanmar) and English. Never use any other language.`,
        },
        ...history,
        { role: 'user', content: userText },
      ],
    }),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error(`${res.status}: ${t.slice(0, 120)}`)
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('Empty response')
  return content
}

function offlineReply(userText: string, profile: UserProfile): string {
  const text = userText.trim()
  const lower = text.toLowerCase()
  const level = profile.currentLevel

  // Writing correction request
  if (
    lower.startsWith('check:') ||
    lower.startsWith('ပြင်:') ||
    lower.startsWith('correct:') ||
    /please (check|correct|fix)/i.test(text)
  ) {
    const body = text.replace(/^(check:|ပြင်:|correct:)\s*/i, '').replace(/^please (check|correct|fix)\s*/i, '')
    const fb = checkWriting(body, 30)
    const issues = fb.issues
      .slice(0, 6)
      .map(
        (i, n) =>
          `${n + 1}. “${i.original}” → ${i.suggestion}\n   ${i.reasonMy}`,
      )
      .join('\n')
    return `${fb.overallMy}\n\n${issues || 'အဓိက အမှား မတွေ့ပါ။'}\n\n💡 နောက်တစ်ဆင့်:\n${fb.nextStepsMy.map((s) => `• ${s}`).join('\n')}`
  }

  // Grammar topics
  if (/present perfect|ပြီးခဲ့|have\/has/i.test(text)) {
    return `📘 Present Perfect (have/has + V3)

အသုံး:
• အတိတ်က စပြီး အခုထိ ဆက်စပ်နေသော အတွေ့အကြုံ/ရလဒ်
• ဥပမာ: I have lived in Yangon for 3 years.
• since 2020 / for 3 years

❌ I have seen him yesterday. → ✅ I saw him yesterday.
(yesterday ကဲ့သို့ တိကျသော အတိတ်အချိန် ရှိရင် Past Simple)

သင့် level ${level} အတွက်: “I have never…” / “Have you ever…?” ဖြင့် ၅ ကြောင်း ရေးကြည့်ပါ။ check: နောက်ကနေ ပို့နိုင်သည်။`
  }

  if (/article|a\/an\/the|a နဲ့ the/i.test(text)) {
    return `📘 Articles (a / an / the)

• a/an = တစ်ခု (ပထမအကြိမ် ဖော်ပြ) — an + vowel sound (an hour)
• the = သိပြီးသား / တစ်ခုတည်းသော အရာ (the sun, the book I bought)
• Ø (မထည့်) = အများကိန်း အထွေထွေ (Cats are cute.) / uncountable (Water is…)

လေ့ကျင့်: “I saw ___ cat. ___ cat was black.” → a, The`
  }

  if (/condition|if clause|if .+ will|ယင်းဆို/i.test(text)) {
    return `📘 Conditionals

1) Zero: If + present, present (အမှန်တရား)
2) First: If + present, will (ဖြစ်နိုင်ခြေ)
3) Second: If + past, would (စိတ်ကူး)
4) Third: If + past perfect, would have + V3 (အတိတ် နောင်တ)

ဥပမာ: If I study daily, I will reach C2.`
  }

  if (/pronunci|အသံထွက်|th sound|ship.?sheep/i.test(text)) {
    return `🔊 အသံထွက် အကြံ

• th (/θ/ /ð/) — လျှာ သွားကြား · three ≠ tree
• ship /ʃɪp/ vs sheep /ʃiːp/ — vowel အရှည်
• word stress: PHOtograph vs phoTOgraphy

App ထဲ Pronunciation စာမျက်နှာတွင် နမူနာနားထောင် → ပြော → score ကြည့်ပါ။`
  }

  if (/vocab|vocabulary|စကားလုံး|srs|anki/i.test(text)) {
    return `📚 Vocabulary SRS

Spaced Repetition = မေ့ခါနီးမှ ပြန်မေးခြင်း။
နေ့စဉ် Vocab စာမျက်နှာတွင်:
1) စကားလုံးအသစ် ထည့်
2) Due cards ပြန်ဖြေ (ထပ်မေး / ခက် / ကောင်း / လွယ်)
3) ဥပမာ စာကြောင်း ကျယ်ကျယ် ဖတ်/ပြော

C2 အတွက် တနေ့ စကားလုံးအသစ် ၈–၁၅ လုံး + review က ပိုအရေးကြီးသည်။`
  }

  if (/study plan|အစီအစဉ်|ဘယ်လို လေ့|how (do|to) study|c2/i.test(text)) {
    const info = LEVEL_LABELS[level]
    return `🎯 သင့်အတွက် (${level} · ${info.my})

${info.canDo}

တနေ့ ၂ နာရီ:
• ၂၀ မိနစ် Vocab SRS
• ၂၅ Listening · ၂၅ Speaking/အသံထွက်
• ၂၅ Reading · ၂၅ Writing
• ၁၅–၂၀ AI Tutor / အမှား ပြန်ဖတ်

တပတ်တခါ Level Test မဖြစ်မနေ။ Dashboard က အားနည်း skill ကို ဦးစားပေးပြီးသား။`
  }

  if (/tense|သဒ္ဒါ|grammar/i.test(text)) {
    return `📗 သဒ္ဒါ အမြန်လမ်းညွှန် (${level})

မေးချင်သော ခေါင်းစဉ်ကို ရေးပါ:
• present perfect
• articles (a/an/the)
• conditionals
• prepositions
• passive voice

သို့မဟုတ် အင်္ဂလိပ်စာကြောင်း ရေးပြီး
check: I go to school yesterday
ဟု ပို့ပါ — ပြင်ပေးမည်။`
  }

  if (/hello|hi|မင်္ဂလာပါ|hey/i.test(text) && text.length < 40) {
    return `မင်္ဂလာပါ ${profile.name}! 👋
ကျွန်တော်က သင့် ${level} အဆင့် အင်္ဂလိပ်ဆရာပါ။

လုပ်နိုင်သည်များ:
• သဒ္ဒါ မေးပါ (ဥပမာ: present perfect ရှင်းပြပါ)
• check: နောက်မှာ စာရေးပြီး ပို့ → ပြင်ပေးမည်
• C2 အစီအစဉ် / အသံထွက် / vocab မေးပါ

Cloud AI သုံးချင်ရင် Tutor စာမျက်နှာ Settings တွင် API key ထည့်ပါ။`
  }

  // Generic teaching response
  if (text.split(/\s+/).length >= 6 && /[a-zA-Z]/.test(text) && !/[\u1000-\u109F]/.test(text)) {
    const fb = checkWriting(text, 20)
    if (fb.issues.length > 0) {
      return `သင့်စာကို စစ်ကြည့်ပါသည်။\n\n${fb.overallMy}\n\n${fb.issues
        .slice(0, 5)
        .map((i) => `• “${i.original}” → ${i.suggestion}\n  ${i.reasonMy}`)
        .join('\n')}\n\nပိုနက်အောင် မေးချင်ရင် မေးခွန်း ထပ်ရေးပါ။`
    }
  }

  return `နားလည်ပါပြီ။ (${level} ဆရာ မုဒ်)

သင်မေးတာ: “${text.slice(0, 120)}${text.length > 120 ? '…' : ''}”

အကူအညီ ပိုတိကျအောင်:
1) "present perfect ရှင်းပြပါ" ကဲ့သို့ ခေါင်းစဉ် ဖော်ပြပါ
2) "check: …" ဖြင့် စာပြင်ခိုင်းပါ
3) Settings တွင် API key ထည့်ပြီး Cloud AI ဖွင့်ပါ — ပိုလွတ်လပ်စွာ စကားပြောနိုင်သည်

ယနေ့ အကြံ: Vocab due cards ကို အရင်ရှင်းပြီး Writing တစ်ပုဒ် ရေးပါ။`
}

export function makeMessage(
  role: ChatMessage['role'],
  content: string,
): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    role,
    content,
    at: new Date().toISOString(),
  }
}
