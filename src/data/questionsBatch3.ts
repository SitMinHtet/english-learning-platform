import type { Question } from '../types'

/** Fill thin skills so sessions are not stuck at ~4 items */
export const QUESTIONS_BATCH3: Question[] = [
  // ——— Speaking A2–C2 ———
  { id: 'a2-s-05', skill: 'speaking', level: 'A2', type: 'speaking', prompt: 'Say: “I am looking for the train station.”', answer: 'I am looking for the train station', explanationMy: 'လမ်းမေးခြင်း။', tipsMy: 'looking /ˈlʊk.ɪŋ/' },
  { id: 'a2-s-06', skill: 'speaking', level: 'A2', type: 'speaking', prompt: 'Say: “How much does this cost?”', answer: 'How much does this cost', explanationMy: 'ဈေးမေးခြင်း။', tipsMy: 'cost /kɒst/' },
  { id: 'a2-s-07', skill: 'speaking', level: 'A2', type: 'speaking', prompt: 'Say: “Can you repeat that, please?”', answer: 'Can you repeat that please', explanationMy: 'ပြန်ပြောခိုင်းခြင်း။', tipsMy: 'repeat /rɪˈpiːt/' },
  { id: 'a2-s-08', skill: 'speaking', level: 'A2', type: 'speaking', prompt: 'Say: “I would like a glass of water.”', answer: 'I would like a glass of water', explanationMy: 'ယဉ်ကျေးစွာ တောင်းခြင်း။', tipsMy: 'would /wʊd/' },
  { id: 'a2-s-09', skill: 'speaking', level: 'A2', type: 'speaking', prompt: 'Say: “Sorry I am late.”', answer: 'Sorry I am late', explanationMy: 'နောက်ကျ၍ တောင်းပန်။', tipsMy: 'sorry /ˈsɒr.i/' },
  { id: 'a2-s-10', skill: 'speaking', level: 'A2', type: 'speaking', prompt: 'Say: “Let us meet at the cafe.”', answer: 'Let us meet at the cafe', explanationMy: 'တွေ့ဆုံရန် အဆိုပြု။', tipsMy: 'cafe /ˈkæf.eɪ/' },

  { id: 'b1-s-05', skill: 'speaking', level: 'B1', type: 'speaking', prompt: 'Say: “I have been practising every day.”', answer: "I've been practising every day", explanationMy: 'Present perfect continuous။', tipsMy: 'practising /ˈpræk.tɪ.sɪŋ/' },
  { id: 'b1-s-06', skill: 'speaking', level: 'B1', type: 'speaking', prompt: 'Say: “What do you think about online learning?”', answer: 'What do you think about online learning', explanationMy: 'ထင်မြင်ချက် မေးခြင်း။', tipsMy: 'think /θɪŋk/' },
  { id: 'b1-s-07', skill: 'speaking', level: 'B1', type: 'speaking', prompt: 'Say: “I agree with you to some extent.”', answer: 'I agree with you to some extent', explanationMy: 'တစ်စိတ်တစ်ပိုင်း သဘောတူ။', tipsMy: 'extent /ɪkˈstent/' },
  { id: 'b1-s-08', skill: 'speaking', level: 'B1', type: 'speaking', prompt: 'Say: “Could you give me an example?”', answer: 'Could you give me an example', explanationMy: 'ဥပမာ တောင်းခြင်း။', tipsMy: 'example /ɪɡˈzɑːm.pəl/' },
  { id: 'b1-s-09', skill: 'speaking', level: 'B1', type: 'speaking', prompt: 'Say: “I need more time to decide.”', answer: 'I need more time to decide', explanationMy: 'ဆုံးဖြတ်ရန် အချိန်ပိုလို။', tipsMy: 'decide /dɪˈsaɪd/' },
  { id: 'b1-s-10', skill: 'speaking', level: 'B1', type: 'speaking', prompt: 'Say: “That sounds like a good plan.”', answer: 'That sounds like a good plan', explanationMy: 'အစီအစဉ်ကို သဘောကျကြောင်း။', tipsMy: 'sounds /saʊndz/' },

  { id: 'b2-s-04', skill: 'speaking', level: 'B2', type: 'speaking', prompt: 'Say: “I would rather discuss this later.”', answer: 'I would rather discuss this later', explanationMy: 'would rather + V1။', tipsMy: 'rather /ˈrɑː.ðə/' },
  { id: 'b2-s-05', skill: 'speaking', level: 'B2', type: 'speaking', prompt: 'Say: “There are advantages and disadvantages.”', answer: 'There are advantages and disadvantages', explanationMy: 'နှစ်ဖက် အားသာ/အားနည်း။', tipsMy: 'advantages /ədˈvɑːn.tɪ.dʒɪz/' },
  { id: 'b2-s-06', skill: 'speaking', level: 'B2', type: 'speaking', prompt: 'Say: “On balance, I support the idea.”', answer: 'On balance I support the idea', explanationMy: 'ခြုံကြည့်လျှင် ထောက်ခံ။', tipsMy: 'balance /ˈbæl.əns/' },
  { id: 'b2-s-07', skill: 'speaking', level: 'B2', type: 'speaking', prompt: 'Say: “That argument is not entirely convincing.”', answer: 'That argument is not entirely convincing', explanationMy: 'အပြည့်အဝ မယုံကြည်စေ။', tipsMy: 'convincing /kənˈvɪn.sɪŋ/' },
  { id: 'b2-s-08', skill: 'speaking', level: 'B2', type: 'speaking', prompt: 'Say: “Let me clarify my point.”', answer: 'Let me clarify my point', explanationMy: 'အချက် ရှင်းပြမည်။', tipsMy: 'clarify /ˈklær.ɪ.faɪ/' },
  { id: 'b2-s-09', skill: 'speaking', level: 'B2', type: 'speaking', prompt: 'Say: “We should consider the long-term effects.”', answer: 'We should consider the long-term effects', explanationMy: 'ရေရှည် အကျိုးဆက်။', tipsMy: 'effects /ɪˈfekts/' },

  { id: 'c1-s-03', skill: 'speaking', level: 'C1', type: 'speaking', prompt: 'Say: “The findings cast doubt on earlier assumptions.”', answer: 'The findings cast doubt on earlier assumptions', explanationMy: 'cast doubt on = သံသယ ဖြစ်စေ။', tipsMy: 'assumptions /əˈsʌmp.ʃənz/' },
  { id: 'c1-s-04', skill: 'speaking', level: 'C1', type: 'speaking', prompt: 'Say: “I remain cautiously optimistic.”', answer: 'I remain cautiously optimistic', explanationMy: 'သတိရှိစွာ အကောင်းမြင်။', tipsMy: 'cautiously /ˈkɔː.ʃəs.li/' },
  { id: 'c1-s-05', skill: 'speaking', level: 'C1', type: 'speaking', prompt: 'Say: “This raises a number of complex issues.”', answer: 'This raises a number of complex issues', explanationMy: 'ရှုပ်ထွေးသော ပြဿနာများ ပေါ်စေ။', tipsMy: 'issues /ˈɪʃ.uːz/' },
  { id: 'c1-s-06', skill: 'speaking', level: 'C1', type: 'speaking', prompt: 'Say: “We need a more nuanced approach.”', answer: 'We need a more nuanced approach', explanationMy: 'သိမ်မွေ့/အသေးစိတ် ချဉ်းကပ်မှု။', tipsMy: 'nuanced /ˈnjuː.ɑːnst/' },
  { id: 'c1-s-07', skill: 'speaking', level: 'C1', type: 'speaking', prompt: 'Say: “The evidence is compelling but incomplete.”', answer: 'The evidence is compelling but incomplete', explanationMy: 'ဆွဲဆောင်အားရှိသော်လည်း မပြည့်စုံ။', tipsMy: 'compelling /kəmˈpel.ɪŋ/' },
  { id: 'c1-s-08', skill: 'speaking', level: 'C1', type: 'speaking', prompt: 'Say: “I would question that premise.”', answer: 'I would question that premise', explanationMy: 'premise = အခြေခံယူဆချက်။', tipsMy: 'premise /ˈprem.ɪs/' },

  { id: 'c2-s-03', skill: 'speaking', level: 'C2', type: 'speaking', prompt: 'Say: “That conclusion strikes me as premature.”', answer: 'That conclusion strikes me as premature', explanationMy: 'စောလွန်းသည်ဟု ထင်။', tipsMy: 'premature /ˈprem.ə.tʃər/' },
  { id: 'c2-s-04', skill: 'speaking', level: 'C2', type: 'speaking', prompt: 'Say: “The claim rests on tenuous assumptions.”', answer: 'The claim rests on tenuous assumptions', explanationMy: 'အားနည်းသော ယူဆချက်များပေါ် အခြေခံ။', tipsMy: 'tenuous /ˈten.ju.əs/' },
  { id: 'c2-s-05', skill: 'speaking', level: 'C2', type: 'speaking', prompt: 'Say: “We should treat this as a working hypothesis.”', answer: 'We should treat this as a working hypothesis', explanationMy: 'ယာယီ အယူအဆအဖြစ်။', tipsMy: 'hypothesis /haɪˈpɒθ.ə.sɪs/' },
  { id: 'c2-s-06', skill: 'speaking', level: 'C2', type: 'speaking', prompt: 'Say: “Style without scrutiny is merely costume.”', answer: 'Style without scrutiny is merely costume', explanationMy: 'စိစစ်မှုမရှိသော စတိုင်။', tipsMy: 'scrutiny /ˈskruː.tɪ.ni/' },
  { id: 'c2-s-07', skill: 'speaking', level: 'C2', type: 'speaking', prompt: 'Say: “Intellectual honesty demands revision.”', answer: 'Intellectual honesty demands revision', explanationMy: 'ဉာဏ်ရည်ရိုးသားမှုက ပြင်ဆင်မှု တောင်းဆို။', tipsMy: 'revision /rɪˈvɪʒ.ən/' },
  { id: 'c2-s-08', skill: 'speaking', level: 'C2', type: 'speaking', prompt: 'Say: “I find the distinction useful rather than absolute.”', answer: 'I find the distinction useful rather than absolute', explanationMy: 'ခွဲခြားမှုကို အသုံးဝင်သည်ဟု မြင်။', tipsMy: 'distinction /dɪˈstɪŋk.ʃən/' },

  // ——— Pronunciation fill ———
  { id: 'a2-p-05', skill: 'pronunciation', level: 'A2', type: 'pronunciation', prompt: 'Pronounce: “February”', answer: 'February', explanationMy: 'အများအားဖြင့် /ˈfeb.rə.ri/ — r တစ်လုံး လျှော့။', tipsMy: 'FEB-roo-ree / FEB-roo-air-ee' },
  { id: 'a2-p-06', skill: 'pronunciation', level: 'A2', type: 'pronunciation', prompt: 'Pronounce: “library”', answer: 'library', explanationMy: '/ˈlaɪ.brər.i/ — “lai-bree” မဟုတ်အောင်။', tipsMy: 'LYE-brer-ee' },
  { id: 'a2-p-07', skill: 'pronunciation', level: 'A2', type: 'pronunciation', prompt: 'Pronounce: “important”', answer: 'important', explanationMy: 'stress ၂ ခုမြောက်: im-POR-tant။', tipsMy: 'im-POR-tuhnt' },
  { id: 'a2-p-08', skill: 'pronunciation', level: 'A2', type: 'pronunciation', prompt: 'Pronounce: “question”', answer: 'question', explanationMy: '/ˈkwes.tʃən/', tipsMy: 'KWES-chuhn' },
  { id: 'a2-p-09', skill: 'pronunciation', level: 'A2', type: 'pronunciation', prompt: 'Pronounce: “usually”', answer: 'usually', explanationMy: '/ˈjuː.ʒu.ə.li/', tipsMy: 'YOO-zhoo-uh-lee' },
  { id: 'a2-p-10', skill: 'pronunciation', level: 'A2', type: 'pronunciation', prompt: 'Pronounce: “temperature”', answer: 'temperature', explanationMy: 'syllable လျှော့: /ˈtem.prə.tʃər/', tipsMy: 'TEM-pruh-chur' },

  { id: 'b1-p-05', skill: 'pronunciation', level: 'B1', type: 'pronunciation', prompt: 'Pronounce: “development”', answer: 'development', explanationMy: 'stress ၂: de-VEL-op-ment။', tipsMy: 'di-VEL-uhp-muhnt' },
  { id: 'b1-p-06', skill: 'pronunciation', level: 'B1', type: 'pronunciation', prompt: 'Pronounce: “environment”', answer: 'environment', explanationMy: '/ɪnˈvaɪ.rən.mənt/', tipsMy: 'in-VIRE-uhn-muhnt' },
  { id: 'b1-p-07', skill: 'pronunciation', level: 'B1', type: 'pronunciation', prompt: 'Pronounce: “opportunity”', answer: 'opportunity', explanationMy: 'stress ၃: op-por-TU-ni-ty။', tipsMy: 'op-er-TOO-ni-tee' },
  { id: 'b1-p-08', skill: 'pronunciation', level: 'B1', type: 'pronunciation', prompt: 'Pronounce: “available”', answer: 'available', explanationMy: '/əˈveɪ.lə.bəl/', tipsMy: 'uh-VAY-luh-buhl' },
  { id: 'b1-p-09', skill: 'pronunciation', level: 'B1', type: 'pronunciation', prompt: 'Pronounce: “experience”', answer: 'experience', explanationMy: '/ɪkˈspɪə.ri.əns/', tipsMy: 'ik-SPEER-ee-uhns' },
  { id: 'b1-p-10', skill: 'pronunciation', level: 'B1', type: 'pronunciation', prompt: 'Pronounce: “particularly”', answer: 'particularly', explanationMy: 'stress ၂: par-TIC-u-lar-ly။', tipsMy: 'per-TIK-yuh-ler-lee' },

  { id: 'b2-p-04', skill: 'pronunciation', level: 'B2', type: 'pronunciation', prompt: 'Pronounce: “consequence”', answer: 'consequence', explanationMy: '/ˈkɒn.sɪ.kwəns/', tipsMy: 'KON-si-kwuhns' },
  { id: 'b2-p-05', skill: 'pronunciation', level: 'B2', type: 'pronunciation', prompt: 'Pronounce: “controversial”', answer: 'controversial', explanationMy: '/ˌkɒn.trəˈvɜː.ʃəl/', tipsMy: 'kon-truh-VUR-shuhl' },
  { id: 'b2-p-06', skill: 'pronunciation', level: 'B2', type: 'pronunciation', prompt: 'Pronounce: “significant”', answer: 'significant', explanationMy: 'sig-NIF-i-cant။', tipsMy: 'sig-NIF-i-kuhnt' },
  { id: 'b2-p-07', skill: 'pronunciation', level: 'B2', type: 'pronunciation', prompt: 'Pronounce: “analysis”', answer: 'analysis', explanationMy: '/əˈnæl.ə.sɪs/', tipsMy: 'uh-NAL-uh-sis' },
  { id: 'b2-p-08', skill: 'pronunciation', level: 'B2', type: 'pronunciation', prompt: 'Pronounce: “hypothesis”', answer: 'hypothesis', explanationMy: '/haɪˈpɒθ.ə.sɪs/', tipsMy: 'hy-POTH-uh-sis' },
  { id: 'b2-p-09', skill: 'pronunciation', level: 'B2', type: 'pronunciation', prompt: 'Pronounce: “necessary”', answer: 'necessary', explanationMy: 'NES-uh-suh-ree (stress ပထမ)။', tipsMy: 'NES-uh-sair-ee' },

  { id: 'c1-p-03', skill: 'pronunciation', level: 'C1', type: 'pronunciation', prompt: 'Pronounce: “entrepreneur”', answer: 'entrepreneur', explanationMy: '/ˌɒn.trə.prəˈnɜːr/', tipsMy: 'on-truh-pruh-NUR' },
  { id: 'c1-p-04', skill: 'pronunciation', level: 'C1', type: 'pronunciation', prompt: 'Pronounce: “bureaucracy”', answer: 'bureaucracy', explanationMy: '/bjʊəˈrɒk.rə.si/', tipsMy: 'byoo-ROK-ruh-see' },
  { id: 'c1-p-05', skill: 'pronunciation', level: 'C1', type: 'pronunciation', prompt: 'Pronounce: “legitimate”', answer: 'legitimate', explanationMy: '/ləˈdʒɪt.ɪ.mət/', tipsMy: 'luh-JIT-uh-muht' },
  { id: 'c1-p-06', skill: 'pronunciation', level: 'C1', type: 'pronunciation', prompt: 'Pronounce: “phenomenon”', answer: 'phenomenon', explanationMy: 'fuh-NOM-uh-nun။', tipsMy: 'fuh-NOM-ih-nun' },
  { id: 'c1-p-07', skill: 'pronunciation', level: 'C1', type: 'pronunciation', prompt: 'Pronounce: “unprecedented”', answer: 'unprecedented', explanationMy: '/ʌnˈpres.ɪ.den.tɪd/', tipsMy: 'un-PRES-ih-den-tid' },
  { id: 'c1-p-08', skill: 'pronunciation', level: 'C1', type: 'pronunciation', prompt: 'Pronounce: “ambiguous”', answer: 'ambiguous', explanationMy: '/æmˈbɪɡ.ju.əs/', tipsMy: 'am-BIG-yoo-uhs' },

  { id: 'c2-p-03', skill: 'pronunciation', level: 'C2', type: 'pronunciation', prompt: 'Pronounce: “quixotic”', answer: 'quixotic', explanationMy: '/kwɪkˈsɒt.ɪk/', tipsMy: 'kwik-SOT-ik' },
  { id: 'c2-p-04', skill: 'pronunciation', level: 'C2', type: 'pronunciation', prompt: 'Pronounce: “perspicacious”', answer: 'perspicacious', explanationMy: '/ˌpɜː.spɪˈkeɪ.ʃəs/', tipsMy: 'per-spi-KAY-shuhs' },
  { id: 'c2-p-05', skill: 'pronunciation', level: 'C2', type: 'pronunciation', prompt: 'Pronounce: “ephemeral”', answer: 'ephemeral', explanationMy: '/ɪˈfem.ər.əl/', tipsMy: 'ih-FEM-uh-ruhl' },
  { id: 'c2-p-06', skill: 'pronunciation', level: 'C2', type: 'pronunciation', prompt: 'Pronounce: “ubiquitous”', answer: 'ubiquitous', explanationMy: '/juːˈbɪk.wɪ.təs/', tipsMy: 'yoo-BIK-wih-tuhs' },
  { id: 'c2-p-07', skill: 'pronunciation', level: 'C2', type: 'pronunciation', prompt: 'Pronounce: “idiosyncrasy”', answer: 'idiosyncrasy', explanationMy: '/ˌɪd.i.əˈsɪŋ.krkrə.si/', tipsMy: 'id-ee-uh-SING-kruh-see' },
  { id: 'c2-p-08', skill: 'pronunciation', level: 'C2', type: 'pronunciation', prompt: 'Pronounce: “anemone”', answer: 'anemone', explanationMy: '/əˈnem.ə.ni/', tipsMy: 'uh-NEM-uh-nee' },

  // ——— Listening fill for thin levels ———
  { id: 'c1-l-05', skill: 'listening', level: 'C1', type: 'listening', prompt: 'What does the speaker recommend?', audioText: 'Before drawing firm conclusions, we should triangulate the data with at least one independent source.', options: ["Ignore data", "Delete the report", "Wait forever", "Use one independent source at least"], answer: 'Use one independent source at least', explanationMy: 'triangulate… with at least one independent source။' },
  { id: 'c1-l-06', skill: 'listening', level: 'C1', type: 'listening', prompt: 'What is the tone?', audioText: 'I appreciate the ambition of the proposal, but the timeline looks unrealistic without extra staff.', options: ["Joke only", "Critical but respectful", "Fully supportive", "Angry"], answer: 'Critical but respectful', explanationMy: 'appreciate… but timeline unrealistic။' },
  { id: 'c1-l-07', skill: 'listening', level: 'C1', type: 'listening', prompt: 'What risk is mentioned?', audioText: 'Rushing the launch could damage our reputation if quality issues appear.', options: ["Too many staff", "Reputation damage from quality issues", "No risk", "Cheap marketing"], answer: 'Reputation damage from quality issues', explanationMy: 'damage our reputation if quality issues appear။' },
  { id: 'c1-l-08', skill: 'listening', level: 'C1', type: 'listening', prompt: 'What will happen next?', audioText: 'We will revise the draft overnight and circulate it for comments tomorrow morning.', options: ["Revise overnight, circulate tomorrow", "Meet next year", "Cancel the draft", "Publish now"], answer: 'Revise overnight, circulate tomorrow', explanationMy: 'revise… overnight and circulate… tomorrow morning။' },

  { id: 'c2-l-04', skill: 'listening', level: 'C2', type: 'listening', prompt: 'What stance is taken?', audioText: 'Unexamined certainty is more dangerous than acknowledged doubt, because it closes the door to revision.', options: ["Unexamined certainty is more dangerous", "Doubt is useless", "Ignore evidence", "Never decide"], answer: 'Unexamined certainty is more dangerous', explanationMy: 'Unexamined certainty is more dangerous than acknowledged doubt။' },
  { id: 'c2-l-05', skill: 'listening', level: 'C2', type: 'listening', prompt: 'What does “scaffolding” suggest here?', audioText: 'Think of strong beliefs as scaffolding: useful for movement, but designed to be adjusted.', options: ["Decoration only", "Legal contracts", "Permanent walls", "Adjustable support"], answer: 'Adjustable support', explanationMy: 'scaffolding… designed to be adjusted။' },
  { id: 'c2-l-06', skill: 'listening', level: 'C2', type: 'listening', prompt: 'What is rejected?', audioText: 'Relativism shrugs and treats every claim as equal; provisional certainty does not.', options: ["Language learning", "All science", "Relativism’s equal claims", "Provisional certainty"], answer: "Relativism’s equal claims", explanationMy: 'Relativism… every claim as equal; provisional certainty does not။' },
  { id: 'c2-l-07', skill: 'listening', level: 'C2', type: 'listening', prompt: 'What should not save a weak claim?', audioText: 'When evidence fails, elegance alone should not save the argument.', options: ["Elegance alone", "More evidence", "Peer review", "Clear definitions"], answer: 'Elegance alone', explanationMy: 'elegance alone should not save the argument။' },

  { id: 'b2-l-06', skill: 'listening', level: 'B2', type: 'listening', prompt: 'What is the next step?', audioText: 'After the pilot, we will collect feedback and decide whether to expand the programme.', options: ["Collect feedback then decide", "Hire no one", "Expand immediately", "Cancel forever"], answer: 'Collect feedback then decide', explanationMy: 'collect feedback and decide whether to expand။' },
  { id: 'b2-l-07', skill: 'listening', level: 'B2', type: 'listening', prompt: 'What concern is raised?', audioText: 'I worry that shorter deadlines will reduce the quality of student writing.', options: ["Quality of writing may fall", "Too many holidays", "Cost of pens", "Classroom colour"], answer: 'Quality of writing may fall', explanationMy: 'shorter deadlines will reduce the quality။' },
  { id: 'b2-l-08', skill: 'listening', level: 'B2', type: 'listening', prompt: 'What does she want?', audioText: 'I would like clearer guidelines before we mark the final essays.', options: ["No guidelines", "Cancel essays", "Clearer guidelines before marking", "Mark without reading"], answer: 'Clearer guidelines before marking', explanationMy: 'clearer guidelines before we mark။' },

  // Extra reading/writing so sessions stay long
  { id: 'a1-r-15', skill: 'reading', level: 'A1', type: 'mcq', prompt: '“___ is the bathroom?”', options: ["Where", "When", "Who", "What"], answer: 'Where', explanationMy: 'Where = ဘယ်မှာ။' },
  { id: 'a1-r-16', skill: 'reading', level: 'A1', type: 'mcq', prompt: '“He ___ a doctor.”', options: ["be", "are", "is", "am"], answer: 'is', explanationMy: 'He/She/It + is။' },
  { id: 'a1-s-07', skill: 'speaking', level: 'A1', type: 'speaking', prompt: 'Say: “Where is the bus stop?”', answer: 'Where is the bus stop', explanationMy: 'ဘတ်စ်မှတ်တိုင် မေးခြင်း။', tipsMy: 'where /weə/' },
  { id: 'a1-s-08', skill: 'speaking', level: 'A1', type: 'speaking', prompt: 'Say: “I do not understand.”', answer: "I do not understand", explanationMy: 'နားမလည်ကြောင်း။', tipsMy: 'understand /ˌʌn.dəˈstænd/' },
  { id: 'a1-s-09', skill: 'speaking', level: 'A1', type: 'speaking', prompt: 'Say: “Can you help me?”', answer: 'Can you help me', explanationMy: 'အကူအညီ တောင်း။', tipsMy: 'help /help/' },
  { id: 'a1-s-10', skill: 'speaking', level: 'A1', type: 'speaking', prompt: 'Say: “Have a nice day.”', answer: 'Have a nice day', explanationMy: 'နေ့ကောင်းပါစေ။', tipsMy: 'nice /naɪs/' },
  { id: 'a1-p-08', skill: 'pronunciation', level: 'A1', type: 'pronunciation', prompt: 'Pronounce: “think”', answer: 'think', explanationMy: 'th = /θ/။', tipsMy: 'think /θɪŋk/' },
  { id: 'a1-p-09', skill: 'pronunciation', level: 'A1', type: 'pronunciation', prompt: 'Pronounce: “with”', answer: 'with', explanationMy: 'th အဆုံး။', tipsMy: 'with /wɪð/' },
  { id: 'a1-p-10', skill: 'pronunciation', level: 'A1', type: 'pronunciation', prompt: 'Pronounce: “people”', answer: 'people', explanationMy: '/ˈpiː.pəl/ — eo = ee။', tipsMy: 'PEE-puhl' },
]
