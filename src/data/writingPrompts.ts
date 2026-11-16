import type { WritingPrompt } from '../types'

export const WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: 'wp-a1-01',
    level: 'A1',
    title: 'About Me',
    titleMy: 'ကိုယ့်အကြောင်း',
    prompt: 'Write 5–8 sentences about yourself: name, age, city, family, hobbies.',
    minWords: 40,
    rubricMy: [
      'ရိုးရှင်းသော ပစ္စုပ္ပန် ရိုးရိုး (I am / I live / I like) သုံးပါ',
      'စာလုံးပေါင်းနှင့် အကြီးအသေး (capital letters) ဂရုစိုက်ပါ',
      'စာကြောင်းတိုင်း အဆုံးတွင် full stop ထည့်ပါ',
    ],
  },
  {
    id: 'wp-a1-02',
    level: 'A1',
    title: 'My Daily Routine',
    titleMy: 'နေ့စဉ် လုပ်ရိုးလုပ်စဉ်',
    prompt: 'Describe your daily routine from morning to night.',
    minWords: 50,
    rubricMy: [
      'အချိန် ပြသော စကားလုံး (in the morning, at night) သုံးပါ',
      'ကြိယာများကို မှန်ကန်စွာ သုံးပါ',
    ],
  },
  {
    id: 'wp-a2-01',
    level: 'A2',
    title: 'A Memorable Day',
    titleMy: 'မှတ်မှတ်ရရ နေ့တစ်နေ့',
    prompt: 'Write about a memorable day in the past. What happened? How did you feel?',
    minWords: 80,
    rubricMy: [
      'Past simple (went, saw, felt) သုံးပါ',
      'အစ–အလယ်–အဆုံး ရှိအောင် ရေးပါ',
      'ခံစားချက် စကားလုံး ထည့်ပါ',
    ],
  },
  {
    id: 'wp-a2-02',
    level: 'A2',
    title: 'Email to a Friend',
    titleMy: 'သူငယ်ချင်းထံ အီးမေးလ်',
    prompt:
      'Write an informal email inviting a friend to visit you this weekend. Include time, place, and plan.',
    minWords: 70,
    rubricMy: [
      'Hi / Dear + အဆုံးတွင် Bye / See you သုံးပါ',
      'Would you like to… / Let’s… ကဲ့သို့ ဖိတ်ကြားချက် ထည့်ပါ',
    ],
  },
  {
    id: 'wp-b1-01',
    level: 'B1',
    title: 'Opinion: Online Learning',
    titleMy: 'ထင်မြင်ချက် — အွန်လိုင်း သင်ယူမှု',
    prompt:
      'Do the advantages of online learning outweigh the disadvantages? Give reasons and examples.',
    minWords: 120,
    rubricMy: [
      'In my opinion / On the one hand / However စသည့် connectors သုံးပါ',
      'ဥပမာ အနည်းဆုံး တစ်ခု ပေးပါ',
      'နိဂုံးချုပ် ရှိပါစေ',
    ],
  },
  {
    id: 'wp-b1-02',
    level: 'B1',
    title: 'Problem & Solution',
    titleMy: 'ပြဿနာနှင့် ဖြေရှင်းချက်',
    prompt:
      'Traffic congestion is a problem in many cities. Describe the problem and suggest two solutions.',
    minWords: 130,
    rubricMy: [
      'ပြဿနာကို ရှင်းပြ → ဖြေရှင်းချက် ၂ ခု → နိဂုံး',
      'One solution is… / Another way is… သုံးပါ',
    ],
  },
  {
    id: 'wp-b2-01',
    level: 'B2',
    title: 'For and Against Essay',
    titleMy: 'ထောက်ခံ/ကန့်ကွက် စာစီစာကုံး',
    prompt:
      'Some people believe university education should be free for everyone. Discuss both views and give your own opinion.',
    minWords: 180,
    rubricMy: [
      'နှစ်ဖက်လုံး ဆွေးနွေးပြီး ကိုယ့်အမြင် ပေးပါ',
      'Complex sentences နှင့် precise vocabulary သုံးပါ',
      'Paragraphing ရှင်းလင်းပါ',
    ],
  },
  {
    id: 'wp-b2-02',
    level: 'B2',
    title: 'Report: Local Facilities',
    titleMy: 'အစီရင်ခံစာ — ဒေသခံ အဆောက်အအုံများ',
    prompt:
      'Write a short report on public facilities in your area. Include strengths, weaknesses, and recommendations.',
    minWords: 160,
    rubricMy: [
      'ခေါင်းစဉ်ခွဲများ သုံးနိုင်သည်',
      'အကြံပြုချက်များကို အကြံပြုပုံစံ (should / could) ဖြင့် ရေးပါ',
    ],
  },
  {
    id: 'wp-c1-01',
    level: 'C1',
    title: 'Discursive Essay',
    titleMy: 'ဆန်းစစ် ဆွေးနွေးစာ',
    prompt:
      '“Technological progress always improves quality of life.” To what extent do you agree? Support with reasoned argument.',
    minWords: 220,
    rubricMy: [
      'hedging (may, tend to, to some extent) သုံးပါ',
      'counter-argument ကို ဖော်ထုတ်ပြီး ပြန်ချေပပါ',
      'Academic tone ထိန်းပါ',
    ],
  },
  {
    id: 'wp-c1-02',
    level: 'C1',
    title: 'Proposal Letter',
    titleMy: 'အဆိုပြုစာ',
    prompt:
      'Write a formal proposal to your local council suggesting improvements to youth education programmes.',
    minWords: 200,
    rubricMy: [
      'Formal register (I am writing to propose…)',
      'ရည်ရွယ်ချက်၊ အကျိုးကျေးဇူး၊ အကောင်အထည်ဖော်မှု အဆင့်များ ပါပါစေ',
    ],
  },
  {
    id: 'wp-c2-01',
    level: 'C2',
    title: 'Critical Analysis',
    titleMy: 'ဝေဖန်ပိုင်းခြား ဆန်းစစ်ခြင်း',
    prompt:
      'Analyse the claim that bilingualism confers cognitive advantages. Evaluate the strength of popular arguments and note caveats.',
    minWords: 280,
    rubricMy: [
      'Nuance နှင့် caveat ဖော်ပြပါ',
      'အလွန်အကျွံ generalization ရှောင်ပါ',
      'Stylistic control — variety without verbosity',
    ],
  },
  {
    id: 'wp-c2-02',
    level: 'C2',
    title: 'Editorial',
    titleMy: 'အယ်ဒီတာ့အာဘော်',
    prompt:
      'Write an editorial on the tension between free speech and social responsibility online. Aim for persuasive sophistication.',
    minWords: 260,
    rubricMy: [
      'Rhetorical control နှင့် precise diction',
      'False dichotomy ရှောင်ပါ',
      'Memorable but restrained closing',
    ],
  },
]
