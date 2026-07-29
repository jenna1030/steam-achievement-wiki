import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { GuideForm } from '../components/guide/GuideForm'
import {
  useAchievementDetailQuery,
  useAchievementsQuery,
} from '../hooks/useAchievementsQuery'
import { useGamesQuery } from '../hooks/useGamesQuery'
import { useGuideStore } from '../stores/guideStore'
import type { Achievement } from '../types/achievement'
import type { GuideFormValues } from '../types/guide'
import {
  getAchievementPath,
  getGameIdFromAchievementId,
  matchesAchievementId,
  normalizeAchievementId,
} from '../utils/achievementIdentity'

interface GuideEditorLocationState {
  achievement?: Achievement
}

export function GuideEditorPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const guideId = Number(searchParams.get('guideId'))
  const achievementId = normalizeAchievementId(
    searchParams.get('achievementId') ?? '',
  )
  const [selectedGameId, setSelectedGameId] = useState(
    getGameIdFromAchievementId(achievementId) ?? 1145350,
  )
  const userGuides = useGuideStore((state) => state.userGuides)
  const addGuide = useGuideStore((state) => state.addGuide)
  const updateGuide = useGuideStore((state) => state.updateGuide)
  const editingGuide = userGuides.find((guide) => guide.id === guideId)
  const stateAchievement = (location.state as GuideEditorLocationState | null)
    ?.achievement
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
  const defaultAchievementFromState =
    stateAchievement &&
    matchesAchievementId(stateAchievement, defaultAchievementId)
      ? stateAchievement
      : undefined
  const resolvedDefaultAchievement =
    defaultAchievement ?? defaultAchievementFromState
  const selectableAchievements =
    defaultAchievementFromState &&
    defaultAchievementFromState.gameId === selectedGameId &&
    !achievements.some(
      (achievement) => achievement.id === defaultAchievementFromState.id,
    )
      ? [defaultAchievementFromState, ...achievements]
      : achievements

  useEffect(() => {
    if (resolvedDefaultAchievement) {
      setSelectedGameId(resolvedDefaultAchievement.gameId)
      return
    }

    if (!resolvedDefaultAchievement && games.length > 0) {
      setSelectedGameId(games[0].id)
    }
  }, [games, resolvedDefaultAchievement])

  const handleSubmit = (values: GuideFormValues) => {
    const selectedAchievement = selectableAchievements.find(
      (achievement) => achievement.id === values.achievementId,
    )

    if (editingGuide) {
      updateGuide(editingGuide.id, values)
      navigate(getAchievementPath(values.achievementId), {
        state: { achievement: selectedAchievement },
      })
      return
    }

    const guide = addGuide(values)
    navigate(getAchievementPath(guide.achievementId), {
      state: { achievement: selectedAchievement },
    })
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
          <Link
            className="text-link"
            to={getAchievementPath(editingGuide.achievementId)}
          >
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
            achievements={selectableAchievements}
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
