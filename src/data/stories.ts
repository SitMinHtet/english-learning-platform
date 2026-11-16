import type { CEFRLevel, UserProfile } from '../types'
import { LEVEL_ORDER, LEVELS } from './cefr'

export interface StoryQuiz {
  prompt: string
  promptMy?: string
  options: string[]
  answer: string
  explanationMy: string
}

export interface Story {
  id: string
  level: CEFRLevel
  title: string
  titleMy: string
  genre: string
  genreMy: string
  minutes: number
  words: number
  summaryMy: string
  /** Book-like body — paragraphs separated by blank lines */
  body: string
  glossary: Array<{ word: string; meaningMy: string }>
  quiz: StoryQuiz[]
}

export const STORIES: Story[] = [
  {
    id: 'st-a1-01',
    level: 'A1',
    title: 'A Day with Mina',
    titleMy: 'မီနာနှင့် တစ်နေ့တာ',
    genre: 'Daily life',
    genreMy: 'နေ့စဉ်ဘဝ',
    minutes: 8,
    words: 160,
    summaryMy: 'မီနာ၏ မနက်မှ ညအထိ ရိုးရှင်းသော နေ့စဉ်ဘဝ။',
    body: `Mina lives in Yangon. She wakes up at six o’clock every morning. She washes her face and eats breakfast with her family. She likes rice and eggs.

At seven thirty, Mina goes to school by bus. The bus is often full, but she always finds a seat near the window. She looks at the city and listens to music.

At school, Mina studies English, maths, and science. Her favourite subject is English. She wants to speak English well.

After school, Mina helps her mother at home. In the evening, she does her homework and talks with her friends online. She goes to bed at ten.`,
    glossary: [
      { word: 'wakes up', meaningMy: 'အိပ်ရာထသည်' },
      { word: 'breakfast', meaningMy: 'နံနက်စာ' },
      { word: 'favourite', meaningMy: 'အကြိုက်ဆုံး' },
      { word: 'homework', meaningMy: 'အိမ်စာ' },
    ],
    quiz: [
      {
        prompt: 'What time does Mina wake up?',
        options: ["6:00", "5:00", "7:30", "10:00"],
        answer: '6:00',
        explanationMy: 'She wakes up at six o’clock။',
      },
      {
        prompt: 'How does she go to school?',
        options: ["By car", "By bike", "On foot", "By bus"],
        answer: 'By bus',
        explanationMy: 'goes to school by bus။',
      },
      {
        prompt: 'What is her favourite subject?',
        options: ["Art", "English", "Science", "Maths"],
        answer: 'English',
        explanationMy: 'Her favourite subject is English။',
      },
    ],
  },
  {
    id: 'st-a1-02',
    level: 'A1',
    title: 'The Lost Cat',
    titleMy: 'ပျောက်နေသော ကြောင်',
    genre: 'Short story',
    genreMy: 'ပုံပြင်တို',
    minutes: 7,
    words: 140,
    summaryMy: 'ကိုကို၏ ကြောင်ပျောက်ပြီး ပြန်တွေ့သော ဇာတ်လမ်း။',
    body: `Ko Ko has a small black cat. The cat’s name is Night. One morning, Night is not in the house. Ko Ko looks under the bed and behind the door. The cat is not there.

Ko Ko walks to the park. He calls, “Night! Night!” A girl points to a tree. Night is on a branch. Ko Ko is happy. He takes Night home and gives the cat some milk.

That night, Ko Ko closes the door carefully. He does not want to lose Night again.`,
    glossary: [
      { word: 'lost', meaningMy: 'ပျောက်သော' },
      { word: 'branch', meaningMy: 'သစ်ခက်' },
      { word: 'carefully', meaningMy: 'သတိထား၍' },
    ],
    quiz: [
      {
        prompt: 'What colour is the cat?',
        options: ["Brown", "White", "Black", "Orange"],
        answer: 'Black',
        explanationMy: 'a small black cat။',
      },
      {
        prompt: 'Where does Ko Ko find Night?',
        options: ["In a shop", "In the kitchen", "At school", "On a tree"],
        answer: 'On a tree',
        explanationMy: 'Night is on a branch (tree)။',
      },
    ],
  },
  {
    id: 'st-a2-01',
    level: 'A2',
    title: 'Rainy Market Morning',
    titleMy: 'မိုးရွာသော ဈေးမနက်',
    genre: 'Daily life',
    genreMy: 'နေ့စဉ်ဘဝ',
    minutes: 10,
    words: 220,
    summaryMy: 'မိုးရွာချိန်တွင် ဈေးသွားသော မိသားစု ဇာတ်လမ်း။',
    body: `Last Saturday, Su Su and her father went to the market early. The sky was grey, and soft rain began to fall. Su Su carried a small umbrella, and her father carried a large bag.

At the market, they bought vegetables, fish, and fresh fruit. A seller smiled and said, “The mangoes are sweet today.” Su Su tasted a small piece and nodded. They bought six mangoes.

On the way home, the rain became heavier. Their clothes were a little wet, but they laughed. At home, Su Su’s mother cooked a warm soup. The family sat together and talked about the busy market.

Su Su wrote a short note in her diary: “Rainy days can still be happy.”`,
    glossary: [
      { word: 'umbrella', meaningMy: 'ထီး' },
      { word: 'seller', meaningMy: 'ရောင်းသူ' },
      { word: 'heavier', meaningMy: 'ပိုလေးသော / ပိုများသော (မိုး)' },
      { word: 'diary', meaningMy: 'နေ့စဉ်မှတ်တမ်း' },
    ],
    quiz: [
      {
        prompt: 'What did they buy from the friendly seller?',
        options: ["Books", "Mangoes", "Umbrellas", "Only fish"],
        answer: 'Mangoes',
        explanationMy: 'They bought six mangoes။',
      },
      {
        prompt: 'How did Su Su feel about rainy days at the end?',
        options: ["Afraid", "They can still be happy", "Bored", "Angry"],
        answer: 'They can still be happy',
        explanationMy: '“Rainy days can still be happy.”',
      },
      {
        prompt: 'Who cooked soup?',
        options: ["Mother", "The seller", "Su Su", "Father"],
        answer: 'Mother',
        explanationMy: 'Su Su’s mother cooked a warm soup။',
      },
    ],
  },
  {
    id: 'st-a2-02',
    level: 'A2',
    title: 'The First Train Ride',
    titleMy: 'ပထမဆုံး ရထားစီးခရီး',
    genre: 'Travel',
    genreMy: 'ခရီးသွား',
    minutes: 10,
    words: 210,
    summaryMy: 'ရန်ကုန်မှ မန္တလေးသို့ ပထမဆုံး ရထားစီးခြင်း။',
    body: `U Aung took his first long train ride last month. He travelled from Yangon to Mandalay to visit his uncle. He arrived at the station one hour early because he did not want to miss the train.

The carriage was crowded at first, but later some passengers got off. U Aung watched the green fields and small villages through the window. He shared snacks with a student sitting next to him.

When the train reached Mandalay in the evening, U Aung felt tired but excited. His uncle was waiting with a warm smile. “Welcome,” he said. “Tomorrow I will show you the palace.”

U Aung decided that train travel was slower than a plane, but much more interesting.`,
    glossary: [
      { word: 'carriage', meaningMy: 'ရထားတွဲ' },
      { word: 'crowded', meaningMy: 'လူများပြည့်ကျပ်သော' },
      { word: 'passengers', meaningMy: 'ခရီးသည်များ' },
      { word: 'palace', meaningMy: 'နန်းတော်' },
    ],
    quiz: [
      {
        prompt: 'Why did he arrive early?',
        options: ["To sleep", "To not miss the train", "To meet friends", "To buy food"],
        answer: 'To not miss the train',
        explanationMy: 'he did not want to miss the train။',
      },
      {
        prompt: 'What will they do tomorrow?',
        options: ["Fly home", "Sell snacks", "Take an exam", "Visit the palace"],
        answer: 'Visit the palace',
        explanationMy: 'Tomorrow I will show you the palace။',
      },
    ],
  },
  {
    id: 'st-b1-01',
    level: 'B1',
    title: 'The Night Before the Exam',
    titleMy: 'စာမေးပွဲမတိုင်မီ ည',
    genre: 'School life',
    genreMy: 'ကျောင်းသားဘဝ',
    minutes: 12,
    words: 280,
    summaryMy: 'စာမေးပွဲအကြိုတွင် စိုးရိမ်မှုနှင့် ပြင်ဆင်မှုအကြောင်း။',
    body: `Hlaing could not sleep. Her English exam was the next morning, and her mind kept repeating irregular verbs. She sat up, turned on the lamp, and opened her notebook again.

She did not try to memorise everything. Instead, she reviewed the mistakes she had made during the week. “If I understand why I was wrong,” she whispered, “I will not repeat them.”

At midnight, her older brother brought her a cup of tea. “You have prepared enough,” he said. “Sleep now. A clear mind is better than a tired one.” Hlaing smiled, closed her book, and finally rested.

The next day, the exam felt difficult but fair. When she finished, she was not sure of every answer, yet she felt proud. She had studied with a plan, not with panic.`,
    glossary: [
      { word: 'irregular verbs', meaningMy: 'မမှန်ကန်ပုံစံ ကြိယာများ' },
      { word: 'memorise', meaningMy: 'အလွတ်ကျက်သည်' },
      { word: 'whispered', meaningMy: 'တိုးတိုးပြောသည်' },
      { word: 'panic', meaningMy: 'ထိတ်လန့်မှု / အလျင်စလို စိုးရိမ်မှု' },
    ],
    quiz: [
      {
        prompt: 'What strategy did Hlaing use?',
        options: ["Only sleep", "Memorise everything", "Skip studying", "Review her mistakes"],
        answer: 'Review her mistakes',
        explanationMy: 'she reviewed the mistakes she had made during the week။',
      },
      {
        prompt: 'What did her brother say was better?',
        options: ["A tired mind", "No tea", "Studying all night", "A clear mind"],
        answer: 'A clear mind',
        explanationMy: 'A clear mind is better than a tired one။',
      },
      {
        prompt: 'How did she feel after the exam?',
        options: ["Ashamed", "Angry", "Bored", "Proud"],
        answer: 'Proud',
        explanationMy: 'she felt proud။',
      },
    ],
  },
  {
    id: 'st-b1-02',
    level: 'B1',
    title: 'A Message from the River',
    titleMy: 'မြစ်ထံမှ သတင်းစကား',
    genre: 'Community',
    genreMy: 'လူမှုအသိုင်းအဝိုင်း',
    minutes: 12,
    words: 270,
    summaryMy: 'မြစ်ညစ်ညမ်းမှုကို မြင်တွေ့ပြီး လုပ်ဆောင်သော လူငယ်များ။',
    body: `One afternoon, Nyein and his friends walked along the river near their town. Plastic bottles floated near the bank, and the water smelled strange. An old fisherman shook his head. “It was cleaner when I was young,” he said.

The friends decided to act. They made a simple poster and invited neighbours to a weekend clean-up. Some people doubted that a small group could help. Still, twenty volunteers came with gloves and bags.

By evening, the bank looked better, though the river was not perfect. Nyein posted photos online with a short message: “We cannot clean everything in one day, but we can start.”

A week later, the town council promised more bins. The fisherman waved when he saw Nyein. “Thank you,” he said. “The river heard you.”`,
    glossary: [
      { word: 'floated', meaningMy: 'မျောနေသည်' },
      { word: 'volunteers', meaningMy: 'စေတနာ့ဝန်ထမ်းများ' },
      { word: 'doubted', meaningMy: 'သံသယရှိသည်' },
      { word: 'council', meaningMy: 'ကောင်စီ / အုပ်ချုပ်ရေးအဖွဲ့' },
    ],
    quiz: [
      {
        prompt: 'What problem did they notice?',
        options: ["No fisherman", "Too many boats", "A closed bridge", "Pollution / plastic waste"],
        answer: 'Pollution / plastic waste',
        explanationMy: 'Plastic bottles floated… water smelled strange။',
      },
      {
        prompt: 'How many volunteers came?',
        options: ["100", "2", "20", "5"],
        answer: '20',
        explanationMy: 'twenty volunteers came။',
      },
    ],
  },
  {
    id: 'st-b2-01',
    level: 'B2',
    title: 'The Interview That Changed Direction',
    titleMy: 'ဦးတည်ချက်ပြောင်းစေသော အင်တာဗျူး',
    genre: 'Career',
    genreMy: 'အလုပ်အကိုင်',
    minutes: 14,
    words: 340,
    summaryMy: 'အလုပ်အင်တာဗျူးတစ်ခုက လူငယ်တစ်ဦး၏ လမ်းကြောင်းကို ပြောင်းလဲစေခြင်း။',
    body: `Thaw had prepared carefully for the marketing interview. He practised common questions, polished his CV, and chose a formal shirt. Yet when the interviewer asked, “Tell me about a time you failed,” Thaw froze for a second.

He then described a school project that collapsed because he tried to do everything alone. “I learned that asking for help is not weakness,” he said. The interviewer nodded. “Many candidates hide failure. You analysed it.”

Two days later, Thaw did not get the marketing role. Instead, the company offered him a junior position in customer research. “Your curiosity impressed us,” the email said.

At first Thaw felt disappointed. Marketing had been his plan since university. After a week in research, however, he noticed something unexpected: he enjoyed listening to real customers more than designing slogans. The interview had not closed a door. It had revealed another corridor.`,
    glossary: [
      { word: 'polished', meaningMy: 'ပြင်ဆင်တိုးတက်အောင်လုပ်သည်' },
      { word: 'collapsed', meaningMy: 'ပျက်စီး/မအောင်မြင်ဖြစ်သည်' },
      { word: 'candidates', meaningMy: 'လျှောက်ထားသူများ' },
      { word: 'corridor', meaningMy: 'စင်္ကြံ (ဤနေရာတွင် လမ်းကြောင်းအသစ်)' },
    ],
    quiz: [
      {
        prompt: 'What question made Thaw pause?',
        options: ["A time he failed", "Travel plans", "Salary expectations", "Favourite colour"],
        answer: 'A time he failed',
        explanationMy: 'Tell me about a time you failed။',
      },
      {
        prompt: 'What job was he offered?',
        options: ["No job", "Teacher", "Junior customer research", "Senior manager"],
        answer: 'Junior customer research',
        explanationMy: 'junior position in customer research။',
      },
      {
        prompt: 'What did he eventually enjoy?',
        options: ["Avoiding work", "Hiding failure", "Designing slogans only", "Listening to customers"],
        answer: 'Listening to customers',
        explanationMy: 'enjoyed listening to real customers။',
      },
    ],
  },
  {
    id: 'st-b2-02',
    level: 'B2',
    title: 'Silent Library, Loud Thoughts',
    titleMy: 'တိတ်ဆိတ်သော စာကြည့်တိုက်',
    genre: 'Reflection',
    genreMy: 'စဉ်းစားတွေးတော',
    minutes: 13,
    words: 320,
    summaryMy: 'စာကြည့်တိုက်တွင် ဖတ်ရင်း မိမိကိုယ်ကို ပြန်လည်သုံးသပ်ခြင်း။',
    body: `The public library smelled of paper and rain. Aye sat by the tall window with a novel she had started three times and abandoned twice. This time she promised herself she would finish.

Around her, students typed quietly and an old man turned newspapers with careful hands. Aye realised that silence was not empty. It was full of private effort.

Halfway through the book, a character made a choice Aye disliked. She almost closed the cover in frustration. Then she asked a better question: Why does this choice feel wrong to me? The answer surprised her. She disliked it because she had made a similar choice last year and still regretted it.

When the librarian announced closing time, Aye placed a bookmark with a sense of relief. She had not escaped her thoughts. She had finally listened to them.`,
    glossary: [
      { word: 'abandoned', meaningMy: 'စွန့်လွှတ်ခဲ့သည်' },
      { word: 'frustration', meaningMy: 'စိတ်ပျက်အားငယ်မှု' },
      { word: 'regretted', meaningMy: 'နောင်တရခဲ့သည်' },
      { word: 'bookmark', meaningMy: 'စာအုပ်မှတ်တိုင်' },
    ],
    quiz: [
      {
        prompt: 'Why did Aye almost stop reading?',
        options: ["The library closed early", "Someone shouted", "She disliked a character’s choice", "She lost the book"],
        answer: 'She disliked a character’s choice',
        explanationMy: 'a character made a choice Aye disliked။',
      },
      {
        prompt: 'What did silence contain, in her view?',
        options: ["Fear only", "Private effort", "Nothing", "Only noise"],
        answer: 'Private effort',
        explanationMy: 'Silence… was full of private effort။',
      },
    ],
  },
  {
    id: 'st-c1-01',
    level: 'C1',
    title: 'The Editor’s Doubt',
    titleMy: 'အယ်ဒီတာ၏ သံသယ',
    genre: 'Professional',
    genreMy: 'အလုပ်အကိုင် / မီဒီယာ',
    minutes: 16,
    words: 390,
    summaryMy: 'သတင်းတစ်ပုဒ်ကို ထုတ်မထုတ် ဆုံးဖြတ်ရာတွင် ကျင့်ဝတ်နှင့် ဖိအား။',
    body: `The draft arrived at midnight. It was sharp, well-sourced, and likely to attract attention. As editor, May should have felt satisfaction. Instead, she felt a familiar tension between speed and responsibility.

The story alleged mismanagement in a local education fund. The documents were strong, yet one key witness had asked to remain anonymous for safety. May’s publisher wanted the piece online before rival outlets moved. “If we wait,” he warned, “we lose the moment.”

May reread the closing paragraph. It was elegant, almost too elegant. She removed a phrase that implied guilt beyond what the evidence securely supported. Then she called the reporter. “We publish tomorrow,” she said, “but only after you confirm the second source on record.”

The delay cost them an exclusive. It also protected the paper’s credibility. Months later, when a weaker outlet retracted a related claim, May’s team did not need to apologise. In journalism, she decided, the loudest victory is not always the lasting one.`,
    glossary: [
      { word: 'alleged', meaningMy: 'စွပ်စွဲထားသော / စွပ်စွဲသည်' },
      { word: 'anonymous', meaningMy: 'အမည်မဖော်လိုသော' },
      { word: 'credibility', meaningMy: 'ယုံကြည်ထိုက်မှု' },
      { word: 'retracted', meaningMy: 'ပြန်ရုပ်သိမ်းသည်' },
    ],
    quiz: [
      {
        prompt: 'What tension did May feel?',
        options: ["Design vs colour", "Speed vs responsibility", "Travel vs sleep", "Salary vs holiday"],
        answer: 'Speed vs responsibility',
        explanationMy: 'tension between speed and responsibility။',
      },
      {
        prompt: 'What did she require before publishing?',
        options: ["Second source on record", "More advertising", "A shorter title only", "Anonymous gossip"],
        answer: 'Second source on record',
        explanationMy: 'confirm the second source on record။',
      },
      {
        prompt: 'What did the delay protect?',
        options: ["The rival outlet", "Nothing", "Credibility", "Their exclusive"],
        answer: 'Credibility',
        explanationMy: 'protected the paper’s credibility။',
      },
    ],
  },
  {
    id: 'st-c1-02',
    level: 'C1',
    title: 'Learning in Public',
    titleMy: 'လူသိရှင်ကြား သင်ယူခြင်း',
    genre: 'Essay',
    genreMy: 'စာစီစာကုံး',
    minutes: 15,
    words: 360,
    summaryMy: 'အမှားကို ဖုံးကွယ်ခြင်းထက် ပွင့်ပွင့်လင်းလင်း သင်ယူခြင်းအကြောင်း။',
    body: `Many advanced learners treat mistakes as private emergencies. They rewrite sentences in silence, avoid speaking unless certain, and measure progress only by exams. The result is fragile fluency: polished on paper, hesitant in conversation.

Learning in public does not mean performing for applause. It means accepting that clarity grows through feedback loops—teachers, peers, and even strangers who ask, “Sorry, what do you mean?” Each loop is slightly uncomfortable. That discomfort is information.

There is a useful distinction between shame and accountability. Shame says, “I am bad at English.” Accountability says, “This sentence failed to communicate; here is how I will revise it.” The first identity freezes practice. The second turns practice into craft.

If C2 is mastery, it is mastery of recovery as much as of accuracy. Native speakers repair misunderstandings constantly. Learners who practise repair aloud reach confidence faster than those who wait for perfect drafts that never leave the notebook.`,
    glossary: [
      { word: 'fragile', meaningMy: 'ကြွပ်ဆတ်သော / မခိုင်မာသော' },
      { word: 'hesitant', meaningMy: 'တွန့်ဆုတ်သော' },
      { word: 'accountability', meaningMy: 'တာဝန်ယူမှု' },
      { word: 'repair', meaningMy: 'ပြင်ဆင်ခြင်း (စကားလက်လွဲမှု ပြန်ရှင်း)' },
    ],
    quiz: [
      {
        prompt: 'What is “fragile fluency”?',
        options: ["Perfect conversation", "Strong speaking only", "No grammar knowledge", "Good on paper, hesitant in talk"],
        answer: 'Good on paper, hesitant in talk',
        explanationMy: 'polished on paper, hesitant in conversation။',
      },
      {
        prompt: 'What does accountability emphasise?',
        options: ["I am bad", "Never speak", "Revise what failed to communicate", "Hide notebooks"],
        answer: 'Revise what failed to communicate',
        explanationMy: 'This sentence failed… here is how I will revise it။',
      },
    ],
  },
  {
    id: 'st-c2-01',
    level: 'C2',
    title: 'On Provisional Certainty',
    titleMy: 'ယာယီ သေချာမှုအကြောင်း',
    genre: 'Philosophical essay',
    genreMy: 'အတွေးအခေါ် စာစီစာကုံး',
    minutes: 18,
    words: 420,
    summaryMy: 'အသိပညာကို အပြီးသတ်အမှန်မဟုတ်ဘဲ ယာယီယူဆချက်အဖြစ် ကိုင်တွယ်ခြင်း။',
    body: `We are tempted to treat our strongest beliefs as furniture: solid, placed, beyond rearrangement. Intellectual life asks for a different metaphor. Beliefs are scaffolding. They support movement, yet they remain adjustable when the structure demands it.

Provisional certainty is not relativism. Relativism shrugs and says every claim is equal. Provisional certainty says: this claim is currently best supported; I will act on it; I will also keep the latch unlocked. The difference is practical. Surgeons, judges, and engineers cannot wait for metaphysical perfection. They must decide under uncertainty while remaining open to correction.

Language learners encounter a miniature version of this discipline. A rule that works at B1 may need refinement at C1. An idiom that sounded natural in one context may jar in another. The mature speaker does not abandon rules; he or she holds them with calibrated confidence.

The danger is not commitment. The danger is unexamined commitment. When a sentence, a policy, or a worldview can no longer survive contact with evidence, elegance alone should not save it. Style without scrutiny is merely costume.`,
    glossary: [
      { word: 'scaffolding', meaningMy: 'ငြမ်း / ယာယီထောက်တိုင်' },
      { word: 'relativism', meaningMy: 'အရာရာ တူညီစွာမှန်သည်ဟု ယူဆသော အယူ' },
      { word: 'calibrated', meaningMy: 'ချိန်ညှိထားသော' },
      { word: 'scrutiny', meaningMy: 'သေချာစိစစ်ခြင်း' },
    ],
    quiz: [
      {
        prompt: 'How does the author describe beliefs?',
        options: ["As useless", "As furniture only", "As final laws", "As scaffolding"],
        answer: 'As scaffolding',
        explanationMy: 'Beliefs are scaffolding။',
      },
      {
        prompt: 'What is provisional certainty NOT?',
        options: ["Calibrated confidence", "Acting on best evidence", "Relativism", "Openness to correction"],
        answer: 'Relativism',
        explanationMy: 'Provisional certainty is not relativism။',
      },
      {
        prompt: 'What danger does the essay name?',
        options: ["Learning English", "Unexamined commitment", "Commitment itself", "Using metaphors"],
        answer: 'Unexamined commitment',
        explanationMy: 'The danger is unexamined commitment။',
      },
    ],
  },
  {
    id: 'st-c2-02',
    level: 'C2',
    title: 'The Marginal Note',
    titleMy: 'ဘေးမှတ်ချက်',
    genre: 'Literary short',
    genreMy: 'စာပေပုံပြင်တို',
    minutes: 16,
    words: 380,
    summaryMy: 'စာအုပ်ဘေးမှတ်ချက်တစ်ခုက စာဖတ်သူနှစ်ဦးကို ချိတ်ဆက်ပေးခြင်း။',
    body: `In a second-hand bookshop, a slim volume of essays waited with a cracked spine and a pencil mark on page forty-one. The note said only: “Do not trust the charming paragraph.”

Mya bought the book for the note more than the essays. Who warns a stranger across years with such precision? She read page forty-one twice. The paragraph was indeed charming—rhythmical, confident, almost hypnotic. It was also lightly dishonest, sliding from evidence into assertion.

She left her own note beneath the first: “Thank you. I nearly believed it.” Then she returned the book to the shop’s shelf, an experiment in anonymous tutoring.

Three weeks later the volume was gone. In its place someone had left a different paperback with a card: “Charm is not the enemy. Unchecked charm is.” Mya laughed softly in the aisle. Literature, she thought, is often less a museum than a conversation that refuses to end.`,
    glossary: [
      { word: 'cracked spine', meaningMy: 'ကွဲအက်နေသော စာအုပ်ကျောရိုး' },
      { word: 'assertion', meaningMy: 'အထောက်အထားမခိုင်ဘဲ ပြောဆိုချက်' },
      { word: 'anonymous', meaningMy: 'အမည်မဖော်သော' },
      { word: 'aisle', meaningMy: 'စင်ကြားလမ်းကြောင်း' },
    ],
    quiz: [
      {
        prompt: 'Why did Mya buy the book?',
        options: ["Mostly because of the marginal note", "Her teacher required it", "For its new price", "It had pictures"],
        answer: 'Mostly because of the marginal note',
        explanationMy: 'bought the book for the note more than the essays။',
      },
      {
        prompt: 'What problem did the charming paragraph have?',
        options: ["Too short", "Bad spelling only", "Slid from evidence into assertion", "Wrong page number"],
        answer: 'Slid from evidence into assertion',
        explanationMy: 'sliding from evidence into assertion။',
      },
    ],
  },
]

export function storiesForLevel(level: CEFRLevel): Story[] {
  return STORIES.filter((s) => s.level === level)
}

export function getStory(id: string): Story | undefined {
  return STORIES.find((s) => s.id === id)
}

export function storiesNearLevel(level: CEFRLevel): Story[] {
  const o = LEVEL_ORDER[level]
  return STORIES.filter((s) => Math.abs(LEVEL_ORDER[s.level] - o) <= 1).sort(
    (a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level],
  )
}

/**
 * Today's story for the learner's CEFR level.
 * Rotates by local day index so content changes every calendar day.
 * Prefers unread, but still advances daily within that set.
 */
export function pickDailyStory(
  profile: Pick<UserProfile, 'currentLevel' | 'readStoryIds'>,
  dayIndex: number,
): Story | null {
  const level = profile.currentLevel
  let pool = storiesForLevel(level)
  if (pool.length === 0) pool = storiesNearLevel(level)
  if (pool.length === 0) return null

  const unread = pool.filter((s) => !profile.readStoryIds.includes(s.id))
  const source = unread.length > 0 ? unread : pool
  return source[Math.abs(dayIndex) % source.length]
}

export function storyCountsByLevel(): Record<CEFRLevel, number> {
  const out = Object.fromEntries(LEVELS.map((l) => [l, 0])) as Record<
    CEFRLevel,
    number
  >
  for (const s of STORIES) out[s.level] += 1
  return out
}
