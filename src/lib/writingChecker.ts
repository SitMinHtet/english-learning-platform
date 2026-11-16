import type { WritingFeedback } from '../types'

interface Rule {
  test: RegExp
  suggestion?: string | ((m: RegExpMatchArray) => string)
  reasonMy: string | ((m: RegExpMatchArray) => string)
  severity: 'error' | 'warning' | 'tip'
  originalFromMatch?: boolean
}

const RULES: Rule[] = [
  {
    test: /\b(he|she|it)\s+don't\b/gi,
    suggestion: (m) => `${m[1]} doesn't`,
    reasonMy: 'he/she/it နှင့် don’t မတွဲရပါ — doesn’t သုံးပါ။',
    severity: 'error',
    originalFromMatch: true,
  },
  {
    test: /\b(he|she|it)\s+have\b/gi,
    suggestion: (m) => `${m[1]} has`,
    reasonMy: 'he/she/it + have → has ဖြစ်ရမည်။',
    severity: 'error',
    originalFromMatch: true,
  },
  {
    test: /\b(he|she|it)\s+don't\s+likes?\b/gi,
    suggestion: (m) => `${m[1]} doesn't like`,
    reasonMy: "doesn't ပြီးနောက် ကြိယာ အခြေခံပုံစံ (like) သာ သုံးရသည်။",
    severity: 'error',
    originalFromMatch: true,
  },
  {
    test: /\bi\s+/g,
    suggestion: 'I ',
    reasonMy: 'နာမ်စား I ကို အမြဲ အကြီးစာလုံးဖြင့် ရေးရသည်။',
    severity: 'error',
  },
  {
    test: /\bdoesn'?t\s+(\w+ed|\w+s)\b/gi,
    suggestion: (m) => `doesn't ${m[1].replace(/ed$|s$/, '') || m[1]}`,
    reasonMy: "doesn't/don't နောက်တွင် V1 (အခြေခံကြိယာ) သာ ထားရသည်။",
    severity: 'warning',
    originalFromMatch: true,
  },
  {
    test: /\bgoing\s+to\s+went\b/gi,
    suggestion: 'going to go',
    reasonMy: 'going to နောက်တွင် အခြေခံကြိယာ (go) သုံးရသည်၊ went မဟုတ်။',
    severity: 'error',
  },
  {
    test: /\bmore\s+better\b/gi,
    suggestion: 'better',
    reasonMy: 'better သည် နှိုင်းယှဉ်ပြီးသား — more better မလိုပါ။',
    severity: 'error',
  },
  {
    test: /\bvery\s+unique\b/gi,
    suggestion: 'unique',
    reasonMy: 'unique သည် absolute — very unique ကို တိကျသော စာရေးတွင် ရှောင်သင့်သည်။',
    severity: 'tip',
  },
  {
    test: /\bin\s+the\s+other\s+hand\b/gi,
    suggestion: 'on the other hand',
    reasonMy: 'မှန်ကန်သော အသုံးမှာ on the other hand ဖြစ်သည် (in မဟုတ်)။',
    severity: 'error',
  },
  {
    test: /\bdiscuss\s+about\b/gi,
    suggestion: 'discuss',
    reasonMy: 'discuss သည် about မလို — discuss the topic လို့ တိုက်ရိုက် သုံးပါ။',
    severity: 'error',
  },
  {
    test: /\breturn\s+back\b/gi,
    suggestion: 'return',
    reasonMy: 'return တွင် back အဓိပ္ပာယ် ပါပြီးသား — return back မလို။',
    severity: 'warning',
  },
  {
    test: /\bdespite\s+of\b/gi,
    suggestion: 'despite',
    reasonMy: 'despite နောက် of မထည့်ရ။ (in spite of က of လိုသည်)',
    severity: 'error',
  },
  {
    test: /\balthough\s+[^,.]+[,]\s*but\b/gi,
    suggestion: 'although … (but မပါ)',
    reasonMy: 'although နှင့် but တစ်ကြိမ်တည်း မတွဲပါနှင့် — တစ်ခုတည်း ရွေးပါ။',
    severity: 'error',
    originalFromMatch: true,
  },
  {
    test: /\binterested\s+on\b/gi,
    suggestion: 'interested in',
    reasonMy: 'interested in သုံးရသည် — interested on မဟုတ်။',
    severity: 'error',
  },
  {
    test: /\blook\s+forward\s+to\s+(\w+)\b/gi,
    suggestion: (m) => {
      const w = m[1]
      if (w.endsWith('ing') || ['it', 'your', 'his', 'her', 'their', 'our', 'my'].includes(w.toLowerCase()))
        return m[0]
      return `look forward to ${w}ing`
    },
    reasonMy: 'look forward to နောက်တွင် V-ing (သို့) နာမ် ထားရသည်။',
    severity: 'warning',
    originalFromMatch: true,
  },
  {
    test: /\bsince\s+\d+\s+years?\b/gi,
    suggestion: 'for … years',
    reasonMy: 'ကာလ (နှစ်အရေအတွက်) နှင့် for သုံးပါ။ since သည် အချိန်စမှတ် (since 2020) အတွက်။',
    severity: 'error',
  },
  {
    test: /\bfor\s+\d{4}\b/g,
    suggestion: 'since YYYY',
    reasonMy: 'ခုနှစ် စမှတ် (2020) နှင့် since သုံးပါ — for 2020 မဟုတ်။',
    severity: 'warning',
  },
  {
    test: /\bthere\s+is\s+\w+\s+\w+s\b/gi,
    suggestion: 'there are …',
    reasonMy: 'အများကိန်း နာမ်နှင့် there are သုံးသင့်သည် (အကြောင်းအရာပေါ်မူတည်)။',
    severity: 'tip',
    originalFromMatch: true,
  },
  {
    test: /\ba\s+lot\s+of\b/gi,
    suggestion: 'many / much / a significant number of',
    reasonMy: 'B2+ စာရေးတွင် a lot of အစား တိကျ/တရားဝင်သော အသုံးကို စဉ်းစားပါ။',
    severity: 'tip',
  },
  {
    test: /\bthing[s]?\b/gi,
    suggestion: 'specific noun',
    reasonMy: 'thing(s) အစား တိကျသော နာမ်သုံးပါ — academic writing ပိုကောင်းသည်။',
    severity: 'tip',
  },
  {
    test: /\bI\s+think\s+that\s+I\s+think\b/gi,
    suggestion: 'I think',
    reasonMy: 'ထပ်နေသော အသုံး — တစ်ကြိမ်သာ ရေးပါ။',
    severity: 'warning',
  },
  {
    test: /\bpeople\s+is\b/gi,
    suggestion: 'people are',
    reasonMy: 'people သည် အများကိန်း → people are။',
    severity: 'error',
  },
  {
    test: /\binformations\b/gi,
    suggestion: 'information',
    reasonMy: 'information သည် uncountable — informations မရှိပါ။',
    severity: 'error',
  },
  {
    test: /\badvices\b/gi,
    suggestion: 'advice / pieces of advice',
    reasonMy: 'advice သည် uncountable — advices မဟုတ်။',
    severity: 'error',
  },
  {
    test: /\bresearches\b/gi,
    suggestion: 'research / studies',
    reasonMy: 'research အများအားဖြင့် uncountable။ အများကိန်းလိုရင် studies သုံးပါ။',
    severity: 'warning',
  },
  {
    test: /\bcan\s+able\s+to\b/gi,
    suggestion: 'can / be able to',
    reasonMy: 'can နှင့် able to တစ်ကြိမ်တည်း မတွဲပါနှင့်။',
    severity: 'error',
  },
  {
    test: /\bmust\s+to\b/gi,
    suggestion: 'must',
    reasonMy: 'must နောက် to မလို — must go။',
    severity: 'error',
  },
  {
    test: /([.!?]\s+)([a-z])/g,
    suggestion: (m) => `${m[1]}${m[2].toUpperCase()}`,
    reasonMy: 'စာကြောင်း အသစ်၏ ပထမစာလုံးကို အကြီးရေးပါ။',
    severity: 'warning',
    originalFromMatch: true,
  },
]

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function sentenceCount(text: string): number {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length
}

export function checkWriting(
  text: string,
  minWords = 50,
): WritingFeedback {
  const issues: WritingFeedback['issues'] = []
  const seen = new Set<string>()

  for (const rule of RULES) {
    const re = new RegExp(rule.test.source, rule.test.flags)
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      const original = m[0]
      // Skip "Does/Did/Do he have …" (correct questions)
      if (/\b(he|she|it)\s+have\b/i.test(original)) {
        const before = text.slice(Math.max(0, m.index - 10), m.index).toLowerCase()
        if (/\b(does|did|do)\s+$/.test(before)) continue
      }
      let suggestion =
        typeof rule.suggestion === 'function'
          ? rule.suggestion(m)
          : rule.suggestion ?? ''
      if (suggestion === original) continue
      const key = `${original}→${suggestion}`
      if (seen.has(key)) continue
      seen.add(key)
      const reasonMy =
        typeof rule.reasonMy === 'function' ? rule.reasonMy(m) : rule.reasonMy
      issues.push({
        original,
        suggestion,
        reasonMy,
        severity: rule.severity,
      })
      if (issues.length >= 12) break
    }
    if (issues.length >= 12) break
  }

  const words = wordCount(text)
  const sentences = sentenceCount(text)

  if (words < minWords) {
    issues.unshift({
      original: `(စကားလုံး ${words} လုံး)`,
      suggestion: `အနည်းဆုံး ${minWords} လုံး`,
      reasonMy: `စာသား တိုလွန်းသည်။ ပန်းတိုင် ${minWords} လုံးအထိ တိုးရေးပါ — အကြောင်းပြချက်/ဥပမာ ထည့်ပါ။`,
      severity: 'warning',
    })
  }

  if (sentences < 3 && words > 30) {
    issues.push({
      original: 'paragraph structure',
      suggestion: 'စာကြောင်းများ ခွဲရေးပါ',
      reasonMy: 'စာကြောင်း အနည်းငယ်သာ ရှိသည်။ အကြောင်းအရာကို စာကြောင်းခွဲပြီး ရှင်းလင်းအောင် ရေးပါ။',
      severity: 'tip',
    })
  }

  if (!/[.!?]"?\s*$/.test(text.trim()) && words > 10) {
    issues.push({
      original: text.trim().slice(-20),
      suggestion: '… .',
      reasonMy: 'စာသား အဆုံးတွင် ပုဒ်ဖြတ်ပုဒ်ရပ် (. ! ?) ထည့်ပါ။',
      severity: 'warning',
    })
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length
  const warnCount = issues.filter((i) => i.severity === 'warning').length
  let score = 88
  score -= errorCount * 10
  score -= warnCount * 4
  score -= issues.filter((i) => i.severity === 'tip').length * 1
  if (words >= minWords) score += 4
  if (words >= minWords * 1.3) score += 3
  score = Math.max(25, Math.min(98, score))

  const strengthsMy: string[] = []
  if (words >= minWords) strengthsMy.push('ပန်းတိုင် စကားလုံးအရေအတွက် ပြည့်မီသည်။')
  if (errorCount === 0) strengthsMy.push('အခြေခံ သဒ္ဒါ အမှားကြီး မတွေ့ပါ။')
  if (sentences >= 4) strengthsMy.push('စာကြောင်း အရေအတွက် လုံလောက်စွာ ခွဲထားသည်။')
  if (/however|therefore|moreover|furthermore|in addition|on the other hand/i.test(text)) {
    strengthsMy.push('ချိတ်ဆက်စကားလုံး (cohesive devices) သုံးထားသည် — ကောင်းပါသည်။')
  }
  if (strengthsMy.length === 0) {
    strengthsMy.push('ရေးသားရန် ကြိုးစားမှု ရှိသည် — ဆက်လက် တိုးတက်အောင် လေ့ကျင့်ပါ။')
  }

  const nextStepsMy: string[] = []
  if (errorCount > 0) nextStepsMy.push('အနီရောင် အမှားများကို အရင်ပြင်ပြီး တစ်ကြိမ်ပြန်ရေးပါ။')
  if (words < minWords) nextStepsMy.push('ဥပမာ တစ်ခုနှင့် နိဂုံးတစ်ကြောင်း ထပ်ထည့်ပါ။')
  nextStepsMy.push('ကျယ်သော စကားလုံး (good/bad/thing) အစား တိကျသော ဝေါဟာရ သုံးကြည့်ပါ။')
  nextStepsMy.push('ရေးပြီးရင် ကျယ်ကျယ်ဖတ်ပြီး အသံထွက် စစ်ဆေးပါ (speaking နှင့် ချိတ်ပါ)။')

  let overallMy = ''
  if (score >= 85) {
    overallMy = `ဆရာ့အမြင် — ကောင်းပါသည် (ရမှတ် ${score}/100)။ အဓိက အချက်များ မှန်ကန်ပြီး တိုးတက်မှု ရှိသည်။ အောက်ပါ အကြံပြုချက်လေးများဖြင့် ပိုတိကျအောင် လုပ်ပါ။`
  } else if (score >= 65) {
    overallMy = `ဆရာ့အမြင် — အလယ်အလတ် (ရမှတ် ${score}/100)။ အဓိပ္ပာယ် ရသည်၊ သို့သော် သဒ္ဒါ/ဖွဲ့စည်းပုံ ပြင်ရန် ရှိသည်။ မြန်မာလို ရှင်းပြချက်များကို ဖတ်ပြီး ပြန်ရေးပါ။`
  } else {
    overallMy = `ဆရာ့အမြင် — ပြင်ဆင်ရန် လိုသည် (ရမှတ် ${score}/100)။ စိတ်မပျက်ပါနှင့်။ အမှားတစ်ခုချင်းစီကို နားလည်အောင် ဖတ်ပြီး တိုတို ထပ်ရေးပါ — ဒါက C2 သို့ အမြန်ဆုံး လမ်းဖြစ်သည်။`
  }

  return { overallMy, score, issues, strengthsMy, nextStepsMy }
}
