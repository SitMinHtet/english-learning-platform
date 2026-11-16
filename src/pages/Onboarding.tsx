import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfile } from '../state/ProfileContext'
import { CloudAccount } from '../components/CloudAccount'
import { isCloudSyncConfigured } from '../lib/cloudSync'

export function Onboarding() {
  const [name, setName] = useState('')
  const { startOnboarding, profile } = useProfile()
  const nav = useNavigate()

  // After Google pull, profile appears → Gate leaves onboarding
  if (profile) return null

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
          ဆရာ့ရှင်းပြချက်။ Google မဝင်ဘဲ စသုံးနိုင်သည် — နောက်မှ sync လုပ်လို့ရသည်။
        </p>

        <ul className="muted" style={{ margin: '16px 0', paddingLeft: 18 }}>
          <li>Listening / Speaking / Reading / Writing + အသံထွက်</li>
          <li>အမှားတိုင်း မြန်မာလို ဘာကြောင့်မှားကြောင်း ရှင်းပြ</li>
          <li>တပတ်တခါ level test</li>
          <li>C2 ရောက်ရန် ခန့်မှန်းကာလ auto တွက်ပေး</li>
        </ul>

        <div className="hero-divider">အသစ် စမည် (Guest)</div>
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

        {isCloudSyncConfigured() && (
          <>
            <div className="hero-divider">သို့မဟုတ်</div>
            <CloudAccount variant="onboard" />
          </>
        )}
      </div>
    </div>
  )
}
