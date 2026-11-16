import { NavLink, Outlet } from 'react-router-dom'
import { useProfile } from '../state/ProfileContext'
import { needsWeeklyTest } from '../lib/dailyPlan'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/practice/listening', label: 'Listening' },
  { to: '/practice/speaking', label: 'Speaking' },
  { to: '/practice/pronunciation', label: 'Pronunciation' },
  { to: '/practice/reading', label: 'Reading' },
  { to: '/library', label: 'စာအုပ် / Stories' },
  { to: '/practice/writing', label: 'Writing' },
  { to: '/vocab', label: 'Vocab SRS' },
  { to: '/words', label: 'မှတ်စာလုံး' },
  { to: '/tutor', label: 'AI Tutor' },
  { to: '/test', label: 'Level Test' },
  { to: '/progress', label: 'တိုးတက်မှု' },
  { to: '/guide', label: 'လမ်းညွှန်' },
]

export function Layout() {
  const { profile } = useProfile()
  const weeklyDue = profile ? needsWeeklyTest(profile) : false

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">Path to C2</div>
          <div className="brand-sub">မြန်မာ + English · C2</div>
        </div>
        <nav className="nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {l.label}
              {l.to === '/test' && weeklyDue ? ' •' : ''}
            </NavLink>
          ))}
        </nav>
        {profile && (
          <div className="muted" style={{ marginTop: 'auto', fontSize: '0.85rem' }}>
            <div>
              <strong>{profile.name}</strong>
            </div>
            <div>
              Level {profile.currentLevel} → C2
            </div>
            <div>🔥 {profile.streak} ရက် streak</div>
          </div>
        )}
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
