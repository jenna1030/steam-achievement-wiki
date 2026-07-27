import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { GuideForm } from '../components/guide/GuideForm'
import {
  useAchievementDetailQuery,
  useAchievementsQuery,
} from '../hooks/useAchievementsQuery'
import { useGamesQuery } from '../hooks/useGamesQuery'
import { useGuideStore } from '../stores/guideStore'
import type { GuideFormValues } from '../types/guide'

export function GuideEditorPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const guideId = Number(searchParams.get('guideId'))
  const achievementId = Number(searchParams.get('achievementId') ?? 103)
  const [selectedGameId, setSelectedGameId] = useState(1)
  const userGuides = useGuideStore((state) => state.userGuides)
  const addGuide = useGuideStore((state) => state.addGuide)
  const updateGuide = useGuideStore((state) => state.updateGuide)
  const editingGuide = userGuides.find((guide) => guide.id === guideId)
  const defaultAchievementId = editingGuide?.achievementId ?? achievementId
  const {
    data: defaultAchievement,
    isLoading: isDefaultAchievementLoading,
  } = useAchievementDetailQuery(defaultAchievementId)
  const {
    data: games = [],
    isError: isGamesError,
    isLoading: isGamesLoading,
  } = useGamesQuery()
  const {
    data: achievements = [],
    isError: isAchievementsError,
    isLoading: isAchievementsLoading,
  } = useAchievementsQuery(selectedGameId)

  useEffect(() => {
    if (defaultAchievement) {
      setSelectedGameId(defaultAchievement.gameId)
      return
    }

    if (!defaultAchievement && games.length > 0) {
      setSelectedGameId(games[0].id)
    }
  }, [defaultAchievement, games])

  const handleSubmit = (values: GuideFormValues) => {
    if (editingGuide) {
      updateGuide(editingGuide.id, values)
      navigate(`/achievements/${values.achievementId}`)
      return
    }

    const guide = addGuide(values)
    navigate(`/achievements/${guide.achievementId}`)
  }

  return (
    <main className="page">
      <section className="page-header">
        <p className="eyebrow">Guide Editor</p>
        <h1>{editingGuide ? '공략 수정' : '공략 작성'}</h1>
        <p className="muted">
          힌트, 자세한 공략, 스포일러 포함 공략을 단계별로 작성하는
          페이지입니다.
        </p>
        {editingGuide && (
          <Link className="text-link" to={`/achievements/${editingGuide.achievementId}`}>
            상세 페이지로 돌아가기
          </Link>
        )}
      </section>

      {(isGamesLoading || isAchievementsLoading || isDefaultAchievementLoading) && (
        <LoadingState message="공략 작성 대상을 불러오는 중입니다." />
      )}
      {(isGamesError || isAchievementsError) && <ErrorState />}
      {!isGamesLoading &&
        !isAchievementsLoading &&
        !isDefaultAchievementLoading &&
        !isGamesError &&
        !isAchievementsError && (
          <GuideForm
            achievements={achievements}
            defaultAchievementId={defaultAchievementId}
            defaultGuide={editingGuide}
            games={games}
            selectedGameId={selectedGameId}
            onGameChange={setSelectedGameId}
            onSubmit={handleSubmit}
          />
        )}
    </main>
  )
}
