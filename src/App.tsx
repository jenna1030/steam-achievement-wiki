import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { AppLayout } from './components/layout/AppLayout'
import { LoadingState } from './components/common/LoadingState'
import { useAuthStore } from './stores/authStore'

const AchievementDetailPage = lazy(() =>
  import('./pages/AchievementDetailPage').then((module) => ({
    default: module.AchievementDetailPage,
  })),
)
const ChecklistPage = lazy(() =>
  import('./pages/ChecklistPage').then((module) => ({
    default: module.ChecklistPage,
  })),
)
const GameDetailPage = lazy(() =>
  import('./pages/GameDetailPage').then((module) => ({
    default: module.GameDetailPage,
  })),
)
const GameSearchPage = lazy(() =>
  import('./pages/GameSearchPage').then((module) => ({
    default: module.GameSearchPage,
  })),
)
const GuideEditorPage = lazy(() =>
  import('./pages/GuideEditorPage').then((module) => ({
    default: module.GuideEditorPage,
  })),
)
const HomePage = lazy(() =>
  import('./pages/HomePage').then((module) => ({
    default: module.HomePage,
  })),
)
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
)
const MyPage = lazy(() =>
  import('./pages/MyPage').then((module) => ({
    default: module.MyPage,
  })),
)
const MyGuidesPage = lazy(() =>
  import('./pages/MyGuidesPage').then((module) => ({
    default: module.MyGuidesPage,
  })),
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
)

function App() {
  const hydrateAuth = useAuthStore((state) => state.hydrate)

  useEffect(() => {
    void hydrateAuth()
  }, [hydrateAuth])

  return (
    <Suspense
      fallback={
        <main className="page">
          <LoadingState message="페이지를 불러오는 중입니다." />
        </main>
      }
    >
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
          <Route path="/mypage/guides" element={<MyGuidesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
