import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../state/ProfileContext'

export function Onboarding() {
  const [name, setName] = useState('')
  const { startOnboarding } = useProfile()
  const nav = useNavigate()

  const start = () => {
    startOnboarding(name)
    nav('/test?kind=placement')
  }

  return (
    <div className="hero-onboard">
      <div className="hero-card">
        <div className="chip">Path to C2</div>
        <h1>အင်္ဂလိပ်ကို C2 အထိ</h1>
        <p className="muted">
          တနေ့ ၂ နာရီ၊ ၅ skill (listening/speaking/reading/writing/အသံထွက်)၊ မြန်မာလို
          ဆရာ့ရှင်းပြချက်။ အရင်ဆုံး level စစ်ပြီး သင့်အတွက် အဆင့်ဆင့် လမ်းကြောင်း ဖွင့်ပေးမယ်။
        </p>
        <ul className="muted" style={{ margin: '16px 0', paddingLeft: 18 }}>
          <li>Listening / Speaking / Reading / Writing + အသံထွက်</li>
          <li>အမှားတိုင်း မြန်မာလို ဘာကြောင့်မှားကြောင်း ရှင်းပြ</li>
          <li>တပတ်တခါ level test (မေးခွန်း မထပ်)</li>
          <li>C2 ရောက်ရန် ခန့်မှန်းကာလ auto တွက်ပေး</li>
        </ul>
        <label className="muted" htmlFor="name">
          သင့်နာမည်
        </label>
        <input
          id="name"
          placeholder="ဥပမာ — Min"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && start()}
        />
        <button className="btn" style={{ width: '100%' }} onClick={start}>
          Level စစ်ဆေးမှု စတင်မည်
        </button>
      </div>
    </div>
  )
}
