import type { CEFRLevel, VocabWord } from '../types'

export const VOCAB_BANK: VocabWord[] = [
  // ——— A1 ———
  { id: 'v-a1-01', word: 'hello', meaningMy: 'မင်္ဂလာပါ', example: 'Hello, how are you?', exampleMy: 'မင်္ဂလာပါ၊ ဘယ်လိုလဲ?', level: 'A1', pos: 'exclamation' },
  { id: 'v-a1-02', word: 'family', meaningMy: 'မိသားစု', example: 'I love my family.', exampleMy: 'ငါ့မိသားစုကို ချစ်တယ်။', level: 'A1', pos: 'noun' },
  { id: 'v-a1-03', word: 'water', meaningMy: 'ရေ', example: 'Please give me some water.', exampleMy: 'ရေနည်းနည်း ပေးပါ။', level: 'A1', pos: 'noun' },
  { id: 'v-a1-04', word: 'school', meaningMy: 'ကျောင်း', example: 'She goes to school every day.', exampleMy: 'သူမ နေ့တိုင်း ကျောင်းသွားတယ်။', level: 'A1', pos: 'noun' },
  { id: 'v-a1-05', word: 'happy', meaningMy: 'ပျော်ရွှင်သော', example: 'I am happy today.', exampleMy: 'ဒီနေ့က ငါ ပျော်တယ်။', level: 'A1', pos: 'adj' },
  { id: 'v-a1-06', word: 'eat', meaningMy: 'စားသည်', example: 'We eat dinner at seven.', exampleMy: 'ညနေ ၇ နာရီမှာ ညစာ စားတယ်။', level: 'A1', pos: 'verb' },
  { id: 'v-a1-07', word: 'friend', meaningMy: 'သူငယ်ချင်း', example: 'He is my best friend.', exampleMy: 'သူက ငါ့ အကောင်းဆုံး သူငယ်ချင်း။', level: 'A1', pos: 'noun' },
  { id: 'v-a1-08', word: 'morning', meaningMy: 'မနက်', example: 'Good morning!', exampleMy: 'မင်္ဂလာနံနက်ခင်း!', level: 'A1', pos: 'noun' },
  { id: 'v-a1-09', word: 'book', meaningMy: 'စာအုပ်', example: 'This book is interesting.', exampleMy: 'ဒီစာအုပ်က စိတ်ဝင်စားဖို့ကောင်းတယ်။', level: 'A1', pos: 'noun' },
  { id: 'v-a1-10', word: 'house', meaningMy: 'အိမ်', example: 'Our house is near the park.', exampleMy: 'ငါတို့အိမ်က ပန်းခြံအနီးမှာ။', level: 'A1', pos: 'noun' },
  { id: 'v-a1-11', word: 'work', meaningMy: 'အလုပ်လုပ်သည် / အလုပ်', example: 'I work in an office.', exampleMy: 'ငါ ရုံးမှာ အလုပ်လုပ်တယ်။', level: 'A1', pos: 'verb/noun' },
  { id: 'v-a1-12', word: 'today', meaningMy: 'ဒီနေ့', example: 'Today is Monday.', exampleMy: 'ဒီနေ့က တနင်္လာနေ့။', level: 'A1', pos: 'adv/noun' },
  { id: 'v-a1-13', word: 'big', meaningMy: 'ကြီးသော', example: 'That is a big tree.', exampleMy: 'အဲဒါက သစ်ပင်ကြီး။', level: 'A1', pos: 'adj' },
  { id: 'v-a1-14', word: 'small', meaningMy: 'သေးငယ်သော', example: 'I have a small bag.', exampleMy: 'ငါ့မှာ လက်ဆွဲအိတ်သေးရှိတယ်။', level: 'A1', pos: 'adj' },
  { id: 'v-a1-15', word: 'drink', meaningMy: 'သောက်သည်', example: 'I drink coffee every morning.', exampleMy: 'မနက်တိုင်း ကော်ဖီသောက်တယ်။', level: 'A1', pos: 'verb' },
  { id: 'v-a1-16', word: 'sleep', meaningMy: 'အိပ်သည်', example: 'I sleep at ten.', exampleMy: 'ဆယ်နာရီမှာ အိပ်တယ်။', level: 'A1', pos: 'verb' },
  { id: 'v-a1-17', word: 'city', meaningMy: 'မြို့', example: 'Yangon is a big city.', exampleMy: 'ရန်ကုန်က မြို့ကြီး။', level: 'A1', pos: 'noun' },
  { id: 'v-a1-18', word: 'food', meaningMy: 'အစားအသောက်', example: 'The food is delicious.', exampleMy: 'အစားအသောက်က အရသာရှိတယ်။', level: 'A1', pos: 'noun' },
  { id: 'v-a1-19', word: 'help', meaningMy: 'ကူညီသည်', example: 'Can you help me?', exampleMy: 'ကူညီပေးလို့ရမလား?', level: 'A1', pos: 'verb' },
  { id: 'v-a1-20', word: 'thank', meaningMy: 'ကျေးဇူးတင်သည်', example: 'Thank you very much.', exampleMy: 'အရမ်းကျေးဇူးတင်ပါတယ်။', level: 'A1', pos: 'verb' },
  { id: 'v-a1-21', word: 'name', meaningMy: 'နာမည်', example: 'My name is Min.', exampleMy: 'ငါ့နာမည် မင်း။', level: 'A1', pos: 'noun' },
  { id: 'v-a1-22', word: 'yes', meaningMy: 'ဟုတ်ကဲ့', example: 'Yes, I agree.', exampleMy: 'ဟုတ်ကဲ့၊ သဘောတူပါတယ်။', level: 'A1', pos: 'exclamation' },
  { id: 'v-a1-23', word: 'no', meaningMy: 'မဟုတ်', example: 'No, thank you.', exampleMy: 'မလိုပါဘူး၊ ကျေးဇူးတင်ပါတယ်။', level: 'A1', pos: 'exclamation' },
  { id: 'v-a1-24', word: 'please', meaningMy: 'ကျေးဇူးပြု၍', example: 'Please sit down.', exampleMy: 'ကျေးဇူးပြု၍ ထိုင်ပါ။', level: 'A1', pos: 'adv' },

  // ——— A2 ———
  { id: 'v-a2-01', word: 'usually', meaningMy: 'ပုံမှန်အားဖြင့်', example: 'I usually wake up early.', exampleMy: 'ပုံမှန်အားဖြင့် စောစော အိပ်ရာထတယ်။', level: 'A2', pos: 'adv' },
  { id: 'v-a2-02', word: 'decide', meaningMy: 'ဆုံးဖြတ်သည်', example: 'We decided to stay home.', exampleMy: 'အိမ်မှာပဲ နေဖို့ ဆုံးဖြတ်လိုက်တယ်။', level: 'A2', pos: 'verb' },
  { id: 'v-a2-03', word: 'enough', meaningMy: 'လုံလောက်သော', example: 'Do we have enough time?', exampleMy: 'အချိန် လုံလောက်ရဲ့လား?', level: 'A2', pos: 'det/adj' },
  { id: 'v-a2-04', word: 'prefer', meaningMy: 'ပိုနှစ်သက်သည်', example: 'I prefer tea to coffee.', exampleMy: 'ကော်ဖီထက် လက်ဖက်ရည် ပိုကြိုက်တယ်။', level: 'A2', pos: 'verb' },
  { id: 'v-a2-05', word: 'invite', meaningMy: 'ဖိတ်သည်', example: 'She invited me to the party.', exampleMy: 'သူမ ပါတီကို ဖိတ်တယ်။', level: 'A2', pos: 'verb' },
  { id: 'v-a2-06', word: 'traffic', meaningMy: 'ယာဉ်ကြော', example: 'The traffic was terrible.', exampleMy: 'ယာဉ်ကြော အရမ်း ဆိုးတယ်။', level: 'A2', pos: 'noun' },
  { id: 'v-a2-07', word: 'remember', meaningMy: 'သတိရသည်', example: 'Please remember my birthday.', exampleMy: 'ငါ့မွေးနေ့ကို သတိရပါ။', level: 'A2', pos: 'verb' },
  { id: 'v-a2-08', word: 'borrow', meaningMy: 'ငှားသည် (ယူ)', example: 'Can I borrow your pen?', exampleMy: 'မင်း ဘောပင် ငှားလို့ရမလား?', level: 'A2', pos: 'verb' },
  { id: 'v-a2-09', word: 'forget', meaningMy: 'မေ့သည်', example: 'Do not forget your keys.', exampleMy: 'သော့ကို မမေ့ပါနှင့်။', level: 'A2', pos: 'verb' },
  { id: 'v-a2-10', word: 'travel', meaningMy: 'ခရီးသွားသည်', example: 'I love to travel.', exampleMy: 'ခရီးသွားရတာ ကြိုက်တယ်။', level: 'A2', pos: 'verb' },
  { id: 'v-a2-11', word: 'weather', meaningMy: 'ရာသီဥတု', example: 'The weather is nice today.', exampleMy: 'ဒီနေ့က ရာသီဥတု ကောင်းတယ်။', level: 'A2', pos: 'noun' },
  { id: 'v-a2-12', word: 'busy', meaningMy: 'အလုပ်များသော', example: 'I am busy this week.', exampleMy: 'ဒီအပတ် အလုပ်များတယ်။', level: 'A2', pos: 'adj' },
  { id: 'v-a2-13', word: 'holiday', meaningMy: 'အားလပ်ရက်', example: 'We went on holiday.', exampleMy: 'အားလပ်ရက် ခရီးထွက်ခဲ့တယ်။', level: 'A2', pos: 'noun' },
  { id: 'v-a2-14', word: 'afraid', meaningMy: 'ကြောက်သော', example: 'She is afraid of dogs.', exampleMy: 'သူမ ခွေးကို ကြောက်တယ်။', level: 'A2', pos: 'adj' },
  { id: 'v-a2-15', word: 'agree', meaningMy: 'သဘောတူသည်', example: 'I agree with you.', exampleMy: 'မင်းနဲ့ သဘောတူတယ်။', level: 'A2', pos: 'verb' },
  { id: 'v-a2-16', word: 'quickly', meaningMy: 'မြန်မြန်', example: 'Please come quickly.', exampleMy: 'မြန်မြန် လာပါ။', level: 'A2', pos: 'adv' },

  // ——— B1 ———
  { id: 'v-b1-01', word: 'improve', meaningMy: 'တိုးတက်အောင်လုပ်သည်', example: 'Practice will improve your English.', exampleMy: 'လေ့ကျင့်ရင် အင်္ဂလိပ် တိုးတက်မယ်။', level: 'B1', pos: 'verb' },
  { id: 'v-b1-02', word: 'although', meaningMy: 'သော်လည်း', example: 'Although it rained, we went out.', exampleMy: 'မိုးရွာသော်လည်း အပြင်ထွက်ခဲ့တယ်။', level: 'B1', pos: 'conj' },
  { id: 'v-b1-03', word: 'advantage', meaningMy: 'အားသာချက်', example: 'One advantage is flexibility.', exampleMy: 'အားသာချက် တစ်ခုက ပျော့ပြောင်းမှု။', level: 'B1', pos: 'noun' },
  { id: 'v-b1-04', word: 'reliable', meaningMy: 'ယုံကြည်ရသော', example: 'She is a reliable colleague.', exampleMy: 'သူမက ယုံကြည်ရတဲ့ လုပ်ဖော်ကိုင်ဖက်။', level: 'B1', pos: 'adj' },
  { id: 'v-b1-05', word: 'suggest', meaningMy: 'အကြံပြုသည်', example: 'I suggest taking a break.', exampleMy: 'ခဏနားဖို့ အကြံပြုတယ်။', level: 'B1', pos: 'verb' },
  { id: 'v-b1-06', word: 'experience', meaningMy: 'အတွေ့အကြုံ', example: 'He has a lot of experience.', exampleMy: 'သူ့မှာ အတွေ့အကြုံ များတယ်။', level: 'B1', pos: 'noun' },
  { id: 'v-b1-07', word: 'opportunity', meaningMy: 'အခွင့်အရေး', example: 'This is a great opportunity.', exampleMy: 'ဒါက အခွင့်အရေး ကောင်းတစ်ခု။', level: 'B1', pos: 'noun' },
  { id: 'v-b1-08', word: 'reduce', meaningMy: 'လျှော့ချသည်', example: 'We need to reduce waste.', exampleMy: 'အမှိုက် လျှော့ချဖို့ လိုတယ်။', level: 'B1', pos: 'verb' },
  { id: 'v-b1-09', word: 'achieve', meaningMy: 'အောင်မြင်စွာ ရရှိသည်', example: 'She achieved her goal.', exampleMy: 'သူမ ပန်းတိုင်ကို ရရှိခဲ့တယ်။', level: 'B1', pos: 'verb' },
  { id: 'v-b1-10', word: 'challenge', meaningMy: 'စိန်ခေါ်မှု', example: 'Learning English is a challenge.', exampleMy: 'အင်္ဂလိပ် သင်ရတာ စိန်ခေါ်မှု တစ်ခု။', level: 'B1', pos: 'noun' },
  { id: 'v-b1-11', word: 'confident', meaningMy: 'ယုံကြည်မှုရှိသော', example: 'He feels more confident now.', exampleMy: 'အခု သူ ပိုယုံကြည်မှုရှိလာတယ်။', level: 'B1', pos: 'adj' },
  { id: 'v-b1-12', word: 'explain', meaningMy: 'ရှင်းပြသည်', example: 'Can you explain this word?', exampleMy: 'ဒီစကားလုံးကို ရှင်းပြပေးလို့ရမလား?', level: 'B1', pos: 'verb' },
  { id: 'v-b1-13', word: 'purpose', meaningMy: 'ရည်ရွယ်ချက်', example: 'What is the purpose of this lesson?', exampleMy: 'ဒီသင်ခန်းစာရဲ့ ရည်ရွယ်ချက်က ဘာလဲ?', level: 'B1', pos: 'noun' },
  { id: 'v-b1-14', word: 'succeed', meaningMy: 'အောင်မြင်သည်', example: 'If you practise, you will succeed.', exampleMy: 'လေ့ကျင့်ရင် အောင်မြင်မယ်။', level: 'B1', pos: 'verb' },
  { id: 'v-b1-15', word: 'instead', meaningMy: 'အစား', example: 'Take a walk instead of watching TV.', exampleMy: 'TV ကြည့်မယ့်အစား လမ်းလျှောက်ပါ။', level: 'B1', pos: 'adv' },
  { id: 'v-b1-16', word: 'avoid', meaningMy: 'ရှောင်သည်', example: 'Try to avoid mistakes.', exampleMy: 'အမှားတွေ ရှောင်ကြည့်ပါ။', level: 'B1', pos: 'verb' },

  // ——— B2 ———
  { id: 'v-b2-01', word: 'nevertheless', meaningMy: 'သို့သော်လည်း', example: 'It was difficult; nevertheless, she succeeded.', exampleMy: 'ခက်ခဲ့တယ်၊ သို့သော်လည်း အောင်မြင်ခဲ့တယ်။', level: 'B2', pos: 'adv' },
  { id: 'v-b2-02', word: 'significant', meaningMy: 'ထင်ရှားသော / အရေးပါသော', example: 'There was a significant improvement.', exampleMy: 'ထင်ရှားတဲ့ တိုးတက်မှု ရှိခဲ့တယ်။', level: 'B2', pos: 'adj' },
  { id: 'v-b2-03', word: 'consequence', meaningMy: 'အကျိုးဆက်', example: 'Think about the consequences.', exampleMy: 'အကျိုးဆက်တွေကို စဉ်းစားပါ။', level: 'B2', pos: 'noun' },
  { id: 'v-b2-04', word: 'persuade', meaningMy: 'စည်းရုံးသိမ်းသွင်းသည်', example: 'He persuaded me to join.', exampleMy: 'သူ ပါဝင်ဖို့ စည်းရုံးနိုင်ခဲ့တယ်။', level: 'B2', pos: 'verb' },
  { id: 'v-b2-05', word: 'reluctant', meaningMy: 'မလိုလားသော / တွန့်ဆုတ်သော', example: 'She was reluctant to speak.', exampleMy: 'သူမ ပြောဖို့ တွန့်ဆုတ်နေတယ်။', level: 'B2', pos: 'adj' },
  { id: 'v-b2-06', word: 'emphasize', meaningMy: 'အလေးပေးသည်', example: 'The teacher emphasized accuracy.', exampleMy: 'ဆရာက မှန်ကန်မှုကို အလေးပေးတယ်။', level: 'B2', pos: 'verb' },
  { id: 'v-b2-07', word: 'outcome', meaningMy: 'ရလဒ်', example: 'We are waiting for the outcome.', exampleMy: 'ရလဒ်ကို စောင့်နေတယ်။', level: 'B2', pos: 'noun' },
  { id: 'v-b2-08', word: 'controversial', meaningMy: 'အငြင်းပွားဖွယ်', example: 'It is a controversial topic.', exampleMy: 'ဒါက အငြင်းပွားဖွယ် ခေါင်းစဉ်။', level: 'B2', pos: 'adj' },
  { id: 'v-b2-09', word: 'efficient', meaningMy: 'ထိရောက်သော', example: 'This is a more efficient method.', exampleMy: 'ဒါက ပိုထိရောက်တဲ့ နည်းလမ်း။', level: 'B2', pos: 'adj' },
  { id: 'v-b2-10', word: 'assume', meaningMy: 'ယူဆသည်', example: 'Do not assume that it is easy.', exampleMy: 'လွယ်တယ်လို့ မယူဆပါနှင့်။', level: 'B2', pos: 'verb' },
  { id: 'v-b2-11', word: 'maintain', meaningMy: 'ထိန်းသိမ်းသည်', example: 'Try to maintain a daily habit.', exampleMy: 'နေ့စဉ် အလေ့အကျင့်ကို ထိန်းသိမ်းပါ။', level: 'B2', pos: 'verb' },
  { id: 'v-b2-12', word: 'precise', meaningMy: 'တိကျသော', example: 'Use more precise vocabulary.', exampleMy: 'ပိုတိကျတဲ့ ဝေါဟာရ သုံးပါ။', level: 'B2', pos: 'adj' },
  { id: 'v-b2-13', word: 'relevant', meaningMy: 'ဆက်စပ်သော / သက်ဆိုင်သော', example: 'Is this information relevant?', exampleMy: 'ဒီအချက်အလက်က သက်ဆိုင်ရဲ့လား?', level: 'B2', pos: 'adj' },
  { id: 'v-b2-14', word: 'distinguish', meaningMy: 'ခွဲခြားသိသည်', example: 'Can you distinguish the two sounds?', exampleMy: 'အသံနှစ်ခုကို ခွဲခြားသိနိုင်ရဲ့လား?', level: 'B2', pos: 'verb' },
  { id: 'v-b2-15', word: 'tendency', meaningMy: 'သဘောထား / ဦးတည်ချက်', example: 'There is a tendency to rush.', exampleMy: 'အလျင်စလိုလုပ်တတ်တဲ့ သဘောရှိတယ်။', level: 'B2', pos: 'noun' },
  { id: 'v-b2-16', word: 'flexible', meaningMy: 'ပျော့ပြောင်းသော', example: 'We need a flexible schedule.', exampleMy: 'ပျော့ပြောင်းတဲ့ အချိန်ဇယား လိုတယ်။', level: 'B2', pos: 'adj' },

  // ——— C1 ———
  { id: 'v-c1-01', word: 'nuance', meaningMy: 'သိမ်မွေ့သော ကွာခြားချက်', example: 'She understands cultural nuances.', exampleMy: 'သူမ ယဉ်ကျေးမှုဆိုင်ရာ သိမ်မွေ့မှုတွေကို နားလည်တယ်။', level: 'C1', pos: 'noun' },
  { id: 'v-c1-02', word: 'mitigate', meaningMy: 'ပြင်းထန်မှု လျှော့ချသည်', example: 'Policies can mitigate the risks.', exampleMy: 'မူဝါဒတွေက အန္တရာယ်ကို လျှော့ချနိုင်တယ်။', level: 'C1', pos: 'verb' },
  { id: 'v-c1-03', word: 'pragmatic', meaningMy: 'လက်တွေ့ကျသော', example: 'We need a pragmatic approach.', exampleMy: 'လက်တွေ့ကျတဲ့ ချဉ်းကပ်မှု လိုတယ်။', level: 'C1', pos: 'adj' },
  { id: 'v-c1-04', word: 'undermine', meaningMy: 'အားနည်းအောင် လုပ်သည်', example: 'Rumours can undermine trust.', exampleMy: 'ကောလဟာလတွေက ယုံကြည်မှုကို ထိခိုက်စေနိုင်တယ်။', level: 'C1', pos: 'verb' },
  { id: 'v-c1-05', word: 'coherent', meaningMy: 'ညီညွတ်သော / ဆက်စပ်သော', example: 'Write a coherent argument.', exampleMy: 'ညီညွတ်တဲ့ အငြင်းအခုံ ရေးပါ။', level: 'C1', pos: 'adj' },
  { id: 'v-c1-06', word: 'substantial', meaningMy: 'ကြီးမားသော / များပြားသော', example: 'There is substantial evidence.', exampleMy: 'အထောက်အထား များပြားစွာ ရှိတယ်။', level: 'C1', pos: 'adj' },
  { id: 'v-c1-07', word: 'implication', meaningMy: 'သွယ်ဝိုက် အကျိုးဆက်', example: 'Consider the wider implications.', exampleMy: 'ပိုကျယ်ပြန့်တဲ့ အကျိုးဆက်တွေကို စဉ်းစားပါ။', level: 'C1', pos: 'noun' },
  { id: 'v-c1-08', word: 'scrutinize', meaningMy: 'သေချာ စိစစ်သည်', example: 'Experts scrutinized the data.', exampleMy: 'ကျွမ်းကျင်သူတွေက ဒေတာကို စိစစ်ခဲ့တယ်။', level: 'C1', pos: 'verb' },
  { id: 'v-c1-09', word: 'articulate', meaningMy: 'ရှင်းလင်းစွာ ဖော်ပြသည်', example: 'She articulated her ideas clearly.', exampleMy: 'သူမ အတွေးတွေကို ရှင်းရှင်းလင်းလင်း ပြောနိုင်ခဲ့တယ်။', level: 'C1', pos: 'verb' },
  { id: 'v-c1-10', word: 'compelling', meaningMy: 'ဆွဲဆောင်အားရှိသော', example: 'He made a compelling case.', exampleMy: 'သူ ဆွဲဆောင်အားရှိတဲ့ အကြောင်းပြချက် ပေးခဲ့တယ်။', level: 'C1', pos: 'adj' },
  { id: 'v-c1-11', word: 'ambiguous', meaningMy: 'မရှင်းလင်းသော', example: 'The instruction was ambiguous.', exampleMy: 'ညွှန်ကြားချက်က မရှင်းလင်းဘူး။', level: 'C1', pos: 'adj' },
  { id: 'v-c1-12', word: 'reinforce', meaningMy: 'အားဖြည့်သည်', example: 'Examples reinforce the rule.', exampleMy: 'ဥပမာတွေက စည်းမျဉ်းကို အားဖြည့်ပေးတယ်။', level: 'C1', pos: 'verb' },
  { id: 'v-c1-13', word: 'crucial', meaningMy: 'အရေးကြီးသော', example: 'Daily practice is crucial.', exampleMy: 'နေ့စဉ် လေ့ကျင့်မှုက အရေးကြီးတယ်။', level: 'C1', pos: 'adj' },
  { id: 'v-c1-14', word: 'inevitable', meaningMy: 'မလွှဲမရှောင်သာသော', example: 'Some mistakes are inevitable.', exampleMy: 'အမှားတချို့က မလွှဲမရှောင်သာဘူး။', level: 'C1', pos: 'adj' },
  { id: 'v-c1-15', word: 'depict', meaningMy: 'ပုံဖော်သည် / ဖော်ပြသည်', example: 'The novel depicts modern life.', exampleMy: 'ဝတ္ထုက ခေတ်သစ်ဘဝကို ပုံဖော်ထားတယ်။', level: 'C1', pos: 'verb' },
  { id: 'v-c1-16', word: 'viable', meaningMy: 'ဖြစ်နိုင်သော / အသုံးဝင်သော', example: 'Is this a viable plan?', exampleMy: 'ဒါက ဖြစ်နိုင်တဲ့ အစီအစဉ်လား?', level: 'C1', pos: 'adj' },

  // ——— C2 ———
  { id: 'v-c2-01', word: 'perspicacious', meaningMy: 'ထိုးထွင်းသိမြင်နိုင်သော', example: 'A perspicacious reader notices irony.', exampleMy: 'ထိုးထွင်းသိတဲ့ စာဖတ်သူက irony ကို သတိထားမိတယ်။', level: 'C2', pos: 'adj' },
  { id: 'v-c2-02', word: 'equivocal', meaningMy: 'နှစ်သွယ် / မရှင်းလင်းသော', example: 'His answer was equivocal.', exampleMy: 'သူ့အဖြေက မရှင်းလင်းဘူး။', level: 'C2', pos: 'adj' },
  { id: 'v-c2-03', word: 'tenuous', meaningMy: 'အားနည်းသော / မခိုင်မာသော', example: 'The link between them is tenuous.', exampleMy: 'သူတို့ကြား ဆက်စပ်မှုက အားနည်းတယ်။', level: 'C2', pos: 'adj' },
  { id: 'v-c2-04', word: 'ubiquitous', meaningMy: 'နေရာတိုင်းတွင် ရှိသော', example: 'Smartphones are ubiquitous now.', exampleMy: 'စမတ်ဖုန်းတွေက အခု နေရာတိုင်းမှာ ရှိတယ်။', level: 'C2', pos: 'adj' },
  { id: 'v-c2-05', word: 'ephemeral', meaningMy: 'ခဏတာသာ ဖြစ်သော', example: 'Fame can be ephemeral.', exampleMy: 'နာမည်ကြီးမှုက ခဏတာသာ ဖြစ်နိုင်တယ်။', level: 'C2', pos: 'adj' },
  { id: 'v-c2-06', word: 'idiosyncrasy', meaningMy: 'ထူးခြားသော အကျင့် / လက္ခဏာ', example: 'Each writer has idiosyncrasies.', exampleMy: 'စာရေးဆရာ တိုင်းမှာ ထူးခြားတဲ့ လက္ခဏာတွေ ရှိတယ်။', level: 'C2', pos: 'noun' },
  { id: 'v-c2-07', word: 'notwithstanding', meaningMy: 'ရှိသော်လည်း', example: 'Notwithstanding the risks, they continued.', exampleMy: 'အန္တရာယ် ရှိသော်လည်း ဆက်လုပ်ခဲ့ကြတယ်။', level: 'C2', pos: 'prep' },
  { id: 'v-c2-08', word: 'laconic', meaningMy: 'စကားနည်းသော / တိုတောင်းသော', example: 'His laconic reply ended the debate.', exampleMy: 'သူ့ တိုတောင်းတဲ့ အဖြေက ဆွေးနွေးမှုကို အဆုံးသတ်လိုက်တယ်။', level: 'C2', pos: 'adj' },
  { id: 'v-c2-09', word: 'esoteric', meaningMy: 'အထူးသိသူသာ နားလည်သော', example: 'The theory is rather esoteric.', exampleMy: 'အဲဒီသီအိုရီက အထူးသိသူသာ နားလည်နိုင်တယ်။', level: 'C2', pos: 'adj' },
  { id: 'v-c2-10', word: 'salient', meaningMy: 'အထင်ရှားဆုံး / အဓိက', example: 'Note the salient points.', exampleMy: 'အထင်ရှားဆုံး အချက်တွေကို မှတ်ထားပါ။', level: 'C2', pos: 'adj' },
  { id: 'v-c2-11', word: 'candid', meaningMy: 'ပွင့်လင်းရိုးသားသော', example: 'She gave a candid assessment.', exampleMy: 'သူမ ပွင့်လင်းရိုးသားတဲ့ အကဲဖြတ်ချက် ပေးခဲ့တယ်။', level: 'C2', pos: 'adj' },
  { id: 'v-c2-12', word: 'elicit', meaningMy: 'ထုတ်နှုတ်ရရှိသည်', example: 'Good questions elicit clear answers.', exampleMy: 'မေးခွန်းကောင်းတွေက အဖြေရှင်းလင်းမှု ရစေတယ်။', level: 'C2', pos: 'verb' },
  { id: 'v-c2-13', word: 'paradox', meaningMy: 'ဆန့်ကျင်ဘက်ပုံရသော အမှန်', example: 'It is a paradox of modern life.', exampleMy: 'ဒါက ခေတ်သစ်ဘဝရဲ့ paradox တစ်ခု။', level: 'C2', pos: 'noun' },
  { id: 'v-c2-14', word: 'meticulous', meaningMy: 'အလွန်သေချာသော', example: 'She is meticulous about grammar.', exampleMy: 'သူမ သဒ္ဒါကို အလွန်သေချာတယ်။', level: 'C2', pos: 'adj' },
  { id: 'v-c2-15', word: 'arduous', meaningMy: 'ပင်ပန်းခက်ခဲသော', example: 'Reaching C2 is an arduous journey.', exampleMy: 'C2 ရောက်ဖို့က ပင်ပန်းခက်ခဲတဲ့ ခရီး။', level: 'C2', pos: 'adj' },
  { id: 'v-c2-16', word: 'concise', meaningMy: 'တိုရှင်းသော', example: 'Keep your writing concise.', exampleMy: 'စာရေးတာကို တိုရှင်းအောင် ထားပါ။', level: 'C2', pos: 'adj' },
]

export function vocabByLevel(level: CEFRLevel): VocabWord[] {
  return VOCAB_BANK.filter((w) => w.level === level)
}

export function getVocabWord(
  id: string,
  extra: VocabWord[] = [],
): VocabWord | undefined {
  return (
    VOCAB_BANK.find((w) => w.id === id) ?? extra.find((w) => w.id === id)
  )
}

export function allVocabWords(extra: VocabWord[] = []): VocabWord[] {
  const map = new Map<string, VocabWord>()
  for (const w of VOCAB_BANK) map.set(w.id, w)
  for (const w of extra) map.set(w.id, w)
  return [...map.values()]
}
