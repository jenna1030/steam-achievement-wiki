import { Link, useLocation, useParams } from 'react-router-dom'
import { AchievementMetaPanel } from '../components/achievement/AchievementMetaPanel'
import { ChecklistButton } from '../components/checklist/ChecklistButton'
import { DifficultyVoteChart } from '../components/chart/DifficultyVoteChart'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { SpoilerGuideTabs } from '../components/guide/SpoilerGuideTabs'
import { DifficultyVote } from '../components/vote/DifficultyVote'
import {
  useAchievementDetailQuery,
  useAchievementGuidesQuery,
} from '../hooks/useAchievementsQuery'
import { useGameDetailQuery } from '../hooks/useGameDetailQuery'
import { useGuideStore } from '../stores/guideStore'
import { useVoteStore } from '../stores/voteStore'
import type { Achievement } from '../types/achievement'

interface AchievementLocationState {
  achievement?: Achievement
}

export function AchievementDetailPage() {
  const { achievementId } = useParams()
  const location = useLocation()
  const achievementIdNumber = Number(achievementId)
  const {
    data: queriedAchievement,
    isError: isAchievementError,
    isLoading: isAchievementLoading,
  } = useAchievementDetailQuery(achievementIdNumber)
  const {
    data: relatedGuides = [],
    isError: isGuidesError,
    isLoading: isGuidesLoading,
  } = useAchievementGuidesQuery(achievementIdNumber)
  const stateAchievement = (location.state as AchievementLocationState | null)
    ?.achievement
  const achievement =
    queriedAchievement ??
    (stateAchievement?.id === achievementIdNumber ? stateAchievement : undefined)
  const userGuides = useGuideStore((state) => state.userGuides)
  const deleteGuide = useGuideStore((state) => state.deleteGuide)
  const votes = useVoteStore((state) => state.votes)
  const { data: game } = useGameDetailQuery(achievement?.gameId ?? Number.NaN)
  const combinedGuides = [
    ...userGuides.filter((guide) => guide.achievementId === achievementIdNumber),
    ...relatedGuides,
  ]

  if (isAchievementLoading) {
    return (
      <main className="page">
        <LoadingState message="도전과제 정보를 불러오는 중입니다." />
      </main>
    )
  }

  if (isAchievementError) {
    return (
      <main className="page">
        <ErrorState />
      </main>
    )
  }

  if (!achievement) {
    return (
      <main className="page">
        <section className="empty-state">
          <h1>도전과제를 찾을 수 없습니다.</h1>
          <Link className="button-link" to="/games">
            게임 목록으로
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="page-header achievement-detail-header">
        <p className="eyebrow">{game?.title ?? 'Achievement'}</p>
        <h1>{achievement.title}</h1>
        <p className="muted">{achievement.description}</p>
        {game && (
          <Link className="text-link" to={`/games/${game.id}`}>
            {game.title} 도전과제 목록으로
          </Link>
        )}
      </section>

      <AchievementMetaPanel achievement={achievement} />

      <section className="action-panel">
        <div>
          <p className="eyebrow">Planner</p>
          <h2>이 도전과제 관리하기</h2>
          <p className="muted">
            진행할 도전과제로 저장하거나 완료 상태를 체크리스트에서 관리할 수
            있습니다.
          </p>
        </div>
        <ChecklistButton achievementId={achievement.id} />
      </section>

      <DifficultyVote achievementId={achievement.id} />
      <DifficultyVoteChart
        vote={votes.find((vote) => vote.achievementId === achievement.id)}
      />

      <section className="section embedded-section">
        <div className="section-heading">
          <p className="eyebrow">Guides</p>
          <h2>스포일러 단계별 공략</h2>
          <p className="muted">
            공략을 원하는 만큼만 열어볼 수 있도록 힌트, 자세한 공략, 스포일러
            포함 단계로 나눴습니다.
          </p>
        </div>
        {isGuidesLoading && <LoadingState message="공략을 불러오는 중입니다." />}
        {isGuidesError && <ErrorState />}
        {!isGuidesLoading &&
          !isGuidesError &&
          combinedGuides.map((guide) => (
            <SpoilerGuideTabs
              guide={guide}
              key={`${guide.source ?? 'mock'}-${guide.id}`}
              onDelete={
                guide.source === 'user' ? () => deleteGuide(guide.id) : undefined
              }
            />
          ))}
        {!isGuidesLoading && !isGuidesError && combinedGuides.length === 0 && (
          <div className="empty-state">
            <h3>아직 등록된 공략이 없습니다.</h3>
            <p className="muted">
              이 도전과제의 힌트와 조건을 직접 정리해볼 수 있습니다.
            </p>
            <Link
              className="button-link"
              to={`/guides/new?achievementId=${achievement.id}`}
            >
              공략 작성하기
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
