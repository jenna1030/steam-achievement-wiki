import { Route, Routes } from 'react-router-dom'
import './App.css'
import { AppLayout } from './components/layout/AppLayout'
import { AchievementDetailPage } from './pages/AchievementDetailPage'
import { ChecklistPage } from './pages/ChecklistPage'
import { GameDetailPage } from './pages/GameDetailPage'
import { GameSearchPage } from './pages/GameSearchPage'
import { GuideEditorPage } from './pages/GuideEditorPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MyPage } from './pages/MyPage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<GameSearchPage />} />
        <Route path="/games/:gameId" element={<GameDetailPage />} />
        <Route
          path="/achievements/:achievementId"
          element={<AchievementDetailPage />}
        />
        <Route path="/guides/new" element={<GuideEditorPage />} />
        <Route path="/checklist" element={<ChecklistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
