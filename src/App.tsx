import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProfileProvider, useProfile } from './state/ProfileContext'
import { Layout } from './components/Layout'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { PracticeSkill } from './pages/PracticeSkill'
import { WritingPage } from './pages/WritingPage'
import { LevelTest } from './pages/LevelTest'
import { ProgressPage } from './pages/ProgressPage'
import { GuidePage } from './pages/GuidePage'
import { VocabPage } from './pages/VocabPage'
import { TutorPage } from './pages/TutorPage'
import { LibraryPage } from './pages/LibraryPage'
import { SavedWordsPage } from './pages/SavedWordsPage'
import { SoftLaunchGate } from './components/SoftLaunchGate'

function Gate() {
  const { profile, ready } = useProfile()

  if (!ready) {
    return (
      <div className="hero-onboard">
        <p className="muted">မှတ်တမ်း ပြန်ဖွင့်နေသည်…</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    )
  }

  if (!profile.placementDone) {
    return (
      <Routes>
        <Route path="/test" element={<LevelTest forceKind="placement" />} />
        <Route path="*" element={<Navigate to="/test?kind=placement" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="practice/writing" element={<WritingPage />} />
        <Route path="practice/:skill" element={<PracticeSkill />} />
        <Route path="vocab" element={<VocabPage />} />
        <Route path="words" element={<SavedWordsPage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="tutor" element={<TutorPage />} />
        <Route path="test" element={<LevelTest />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="guide" element={<GuidePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <ProfileProvider>
      <SoftLaunchGate>
        <BrowserRouter>
          <Gate />
        </BrowserRouter>
      </SoftLaunchGate>
    </ProfileProvider>
  )
}
