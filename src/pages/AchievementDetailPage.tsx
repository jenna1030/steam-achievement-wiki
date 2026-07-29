import { useEffect, useMemo } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { AchievementMetaPanel } from '../components/achievement/AchievementMetaPanel'
import { ChecklistButton } from '../components/checklist/ChecklistButton'
import { DifficultyVoteChart } from '../components/chart/DifficultyVoteChart'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { SpoilerGuideTabs } from '../components/guide/SpoilerGuideTabs'
import { DifficultyVote } from '../components/vote/DifficultyVote'
import { useAchievementDetailQuery } from '../hooks/useAchievementsQuery'
import { useGameDetailQuery } from '../hooks/useGameDetailQuery'
import { useAuthStore } from '../stores/authStore'
import { useChecklistStore } from '../stores/checklistStore'
import { useGuideStore } from '../stores/guideStore'
import { useVoteStore } from '../stores/voteStore'
import type { Achievement } from '../types/achievement'
import {
  getGameIdFromAchievementId,
  matchesAchievementId,
  normalizeAchievementId,
} from '../utils/achievementIdentity'
import { isGuideOwnedBy } from '../utils/guideOwnership'
import {
  applyGuideMetadata,
  getAchievementNotices,
  getAchievementTags,
} from '../utils/achievementMetadata'

interface AchievementLocationState {
  achievement?: Achievement
}

export function AchievementDetailPage() {
  const { achievementId } = useParams()
  const location = useLocation()
  const achievementIdValue = normalizeAchievementId(achievementId)
  const stateAchievement = (location.state as AchievementLocationState | null)
    ?.achievement
  const matchingStateAchievement =
    stateAchievement && matchesAchievementId(stateAchievement, achievementIdValue)
      ? stateAchievement
      : undefined
  const inferredGameId = getGameIdFromAchievementId(achievementIdValue)
  const user = useAuthStore((state) => state.user)
  const ownerSteamId = user?.steamId ?? null

  const {
    data: queriedAchievement,
    isError: isAchievementError,
    isLoading: isAchievementLoading,
  } = useAchievementDetailQuery(achievementIdValue)
  const lookupGameId =
    queriedAchievement?.gameId ?? matchingStateAchievement?.gameId ?? inferredGameId
  const {
    data: game,
    isLoading: isGameLoading,
  } = useGameDetailQuery(lookupGameId ?? Number.NaN)
  const rawAchievement = queriedAchievement ?? matchingStateAchievement
  const userGuides = useGuideStore((state) => state.userGuides)
  const deleteGuide = useGuideStore((state) => state.deleteGuide)
  const migrateGuideAchievementId = useGuideStore(
    (state) => state.migrateAchievementId,
  )
  const syncChecklistAchievement = useChecklistStore(
    (state) => state.syncAchievement,
  )
  const votes = useVoteStore((state) => state.votes)
  const migrateVoteAchievementId = useVoteStore(
    (state) => state.migrateAchievementId,
  )
  const legacyAchievementId = String(rawAchievement?.legacyId ?? '')
  const localGuides = useMemo(
    () =>
      rawAchievement
        ? userGuides.filter(
            (guide) =>
              isGuideOwnedBy(guide, user?.steamId) &&
              (guide.achievementId === rawAchievement.id ||
                guide.achievementId === legacyAchievementId),
          )
        : [],
    [legacyAchievementId, rawAchievement, user?.steamId, userGuides],
  )
  const achievement = useMemo(
    () =>
      rawAchievement
        ? applyGuideMetadata(rawAchievement, localGuides[0])
        : undefined,
    [localGuides, rawAchievement],
  )
  const displayTags = achievement ? getAchievementTags(achievement) : []
  const noticeLabels = achievement ? getAchievementNotices(achievement) : []
  const isResolvingSteamAchievement =
    !achievement &&
    inferredGameId !== null &&
    (isAchievementLoading || isGameLoading)

  useEffect(() => {
    if (!achievement) {
      return
    }

    syncChecklistAchievement(achievement)

    if (legacyAchievementId) {
      migrateGuideAchievementId(legacyAchievementId, achievement.id)
      migrateVoteAchievementId(legacyAchievementId, achievement.id)
    }
  }, [
    achievement,
    legacyAchievementId,
    migrateGuideAchievementId,
    migrateVoteAchievementId,
    syncChecklistAchievement,
  ])

  if (isAchievementLoading || isResolvingSteamAchievement) {
    return (
      <main className="page">
        <LoadingState message="도전과제 정보를 불러오는 중입니다." />
      </main>
    )
  }

  if (isAchievementError) {
    return (
      <main className="page">
        <ErrorState
          message="Steam API에서 도전과제 정보를 가져오지 못했습니다. 잠시 후 다시 시도해주세요."
          title="도전과제를 불러오지 못했습니다."
        />
      </main>
    )
  }

  if (!achievement) {
    return (
      <main className="page">
        <section className="page-header achievement-detail-header">
          <p className="eyebrow">Achievement</p>
          <h1>도전과제 자료가 없습니다.</h1>
          <p className="muted">
            아직 저장된 상세 정보나 공략이 없는 도전과제입니다.
          </p>
          <Link className="text-link" to="/games">
            게임 목록으로
          </Link>
        </section>

        <section className="empty-state">
          <h2>자료 없음</h2>
          <p className="muted">
            도전과제 목록에서 다시 선택하거나, 공략 작성 화면에서 직접 자료를
            추가할 수 있습니다.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="page-header achievement-detail-header">
        <p className="eyebrow">{game?.title ?? 'Achievement'}</p>
        <div className="achievement-title-row">
          <img
            className="achievement-detail-icon"
            src={achievement.iconUrl}
            alt=""
          />
          <div>
            <h1>{achievement.title}</h1>
            <p className="muted">{achievement.description}</p>
          </div>
        </div>
        <div className="achievement-detail-badges">
          {displayTags.map((tag) => (
            <span className="tag-badge" key={tag}>
              {tag}
            </span>
          ))}
          {noticeLabels.map((notice) => (
            <span className="notice-badge" key={notice}>
              {notice}
            </span>
          ))}
        </div>
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
        <ChecklistButton achievement={achievement} />
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
            공략이 등록되어 있으면 힌트, 자세한 공략, 스포일러 포함 단계로
            나누어 보여줍니다.
          </p>
        </div>
        {localGuides.map((guide) => (
          <SpoilerGuideTabs
            guide={guide}
            key={guide.id}
            onDelete={() => deleteGuide(guide.id, ownerSteamId)}
          />
        ))}
        {localGuides.length === 0 && (
          <div className="empty-state">
            <h3>등록된 공략이 없습니다.</h3>
            <p className="muted">
              이 도전과제의 힌트와 조건을 직접 정리해볼 수 있습니다.
            </p>
            <Link
              className="button-link"
              state={{ achievement }}
              to={`/guides/new?achievementId=${encodeURIComponent(
                achievement.id,
              )}`}
            >
              공략 작성하기
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
