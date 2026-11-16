import { LEVELS, HOURS_TO_C2, LEVEL_LABELS, formatEtaMy, estimateDaysToC2 } from '../data/cefr'

export function GuidePage() {
  const eta2h = estimateDaysToC2('A1', 120)

  return (
    <>
      <div className="page-head">
        <div>
          <div className="chip">လမ်းညွှန် + အကြံပြုချက်</div>
          <h1 style={{ marginTop: 10 }}>C2 သို့ အမြန်ဆုံး လမ်း</h1>
          <p>
            တနေ့ ၂ နာရီဖြင့် စနစ်တကျ လေ့ကျင့်ရင် ဖြစ်နိုင်သည် — သို့သော် “အလွယ်” ဆိုသည်မှာ
            ရှုပ်ထွေးမှု လျှော့ချထားခြင်းဖြစ်ပြီး ကြိုးစားအားထုတ်မှု မလိုဟု မဆိုလိုပါ။
          </p>
        </div>
      </div>

      <section className="panel">
        <h2>တနေ့ ၂ နာရီ — C2 ခန့်မှန်းကာလ</h2>
        <p style={{ margin: '8px 0 14px' }}>
          CEFR လမ်းညွှန် နာရီများအရ A1 မှ C2 ≈ {HOURS_TO_C2.A1} နာရီ။ တနေ့ ၂ နာရီဖြင့်{' '}
          <strong>{formatEtaMy(eta2h.days, eta2h.months)}</strong> ခန့် (ပုံမှန်အားဖြင့် ၁.၅–၂ နှစ်)။
          အဆင့်မြင့်ပြီးသားဆိုရင် ပိုမြန်သည်။
        </p>
        <div className="grid-3">
          {LEVELS.map((lv) => {
            const e = estimateDaysToC2(lv, 120)
            return (
              <div className="stat" key={lv}>
                <div className="label">
                  {lv} ({LEVEL_LABELS[lv].my})
                </div>
                <div className="value" style={{ fontSize: '1.05rem' }}>
                  {lv === 'C2' ? 'ပန်းတိုင်' : `~${e.months} လ`}
                </div>
                <div className="muted">~{HOURS_TO_C2[lv]} နာရီ ကျန်</div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <h2>ဘာသာစကား စည်းမျဉ်း</h2>
        <p style={{ marginBottom: 16 }}>
          App တစ်ခုလုံးတွင် <strong>မြန်မာ</strong> နှင့် <strong>English</strong> သာ သုံးသည်။
          တခြားဘာသာစကားများ မထည့်ထားပါ။ AI Tutor (Cloud) ကိုလည်း ဤစည်းမျဉ်းအတိုင်း ကန့်သတ်ထားသည်။
        </p>
        <h2>ဤ software ထဲတွင် ပါပြီးသား</h2>
        <ul style={{ paddingLeft: 18 }}>
          <li>ပထမဆုံး placement test + တပတ်တခါ level test (မေးခွန်း ID မထပ်)</li>
          <li>Listening (TTS) · Speaking/အသံထွက် (မိုက်ခရိုဖုန်း score)</li>
          <li>Reading quizzes · Writing ဆရာ့ပြင်ချက် (မြန်မာလို)</li>
          <li>Vocab SRS (SM-2) · AI Tutor (offline + optional API)</li>
          <li>localStorage + IndexedDB မှတ်တမ်း · JSON backup export/import</li>
          <li>Daily ၂ နာရီ plan · skill mastery · ETA to C2 · error journal</li>
        </ul>
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <h2>အပြင်မှာ ထပ်လုပ်သင့်သောအရာများ</h2>
        <div className="grid-2">
          <div>
            <h3 style={{ fontSize: '1rem' }}>၁) Vocab SRS ကို နေ့စဉ် ရှင်းပါ</h3>
            <p className="muted">
              App ထဲမှာ SM-2 ပါပြီးသား — due ကတ်တွေကို နေ့တိုင်း ၅ ကတ်အထက် ရှင်းပါ။
            </p>
            <h3 style={{ fontSize: '1rem', marginTop: 14 }}>၂) Shadowing</h3>
            <p className="muted">
              Podcast/YouTube ကို နားထောင်ရင်း တစ်ပြိုင်နက်လိုက်ပြောခြင်း — fluency + အသံထွက် မြန်ဆန်စေသည်။
            </p>
            <h3 style={{ fontSize: '1rem', marginTop: 14 }}>၃) Input အရည်အသွေး</h3>
            <p className="muted">
              graded reader → news → novels/academic။ Software အပြင် နေ့စဉ် ဖတ်/နားထောင် ၃၀ မိနစ် ထည့်ပါ။
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem' }}>၄) AI Tutor (API) တိုးချဲ့</h3>
            <p className="muted">
              Tutor Settings မှာ API key ထည့်ရင် Cloud ဆရာ + AI နေ့စဉ် pack သုံးနိုင်သည်။
            </p>
            <h3 style={{ fontSize: '1rem', marginTop: 14 }}>၅) Immersion အလေ့အကျင့်</h3>
            <p className="muted">
              ဖုန်းဘာသာစကား အင်္ဂလိပ်၊ နေ့စဉ် မှတ်စု အင်္ဂလိပ်၊ အပတ်စဉ် English-only နာရီ။
            </p>
            <h3 style={{ fontSize: '1rem', marginTop: 14 }}>၆) Official Exam Simulation</h3>
            <p className="muted">
              IELTS/CPE စတိုင် timed tests ထည့်ရင် C1–C2 သက်သေပြရန် အထောက်အကူဖြစ်သည်။
            </p>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <h2>နေ့စဉ် ၂ နာရီ ခွဲနည်း (အကြံပြု)</h2>
        <ol style={{ paddingLeft: 18 }}>
          <li>၂၅ မိနစ် Listening (နားထောင် → မေးခွန်း → အမှားဖတ်)</li>
          <li>၂၅ မိနစ် Speaking + ၁၅ မိနစ် အသံထွက်</li>
          <li>၂၅ မိနစ် Reading</li>
          <li>၂၅ မိနစ် Writing (ရေး → ဆရာ့ပြင် → ပြန်ရေး)</li>
          <li>၅ မိနစ် Error journal ပြန်ဖတ်</li>
        </ol>
        <p className="muted" style={{ marginTop: 12 }}>
          အပတ်စဉ် တနင်္ဂနွေတွင် Level Test ၁ ခု မဖြစ်မနေဖြေပါ။ မေးခွန်းအဟောင်း ထပ်မလာအောင်
          software က used ID များကို သိမ်းထားသည်။
        </p>
      </section>
    </>
  )
}
