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

const STEAM_ONLY_ID_UNIT = 100000

function getSteamOnlyGameId(achievementId: number) {
  if (!Number.isFinite(achievementId) || achievementId < STEAM_ONLY_ID_UNIT) {
    return Number.NaN
  }

  return Math.floor(achievementId / STEAM_ONLY_ID_UNIT)
}

function getDisplayTags(achievement: Achievement) {
  return achievement.tags.length > 0 ? achievement.tags : ['태그 없음']
}

function getNoticeLabels(achievement: Achievement) {
  return [
    achievement.isHidden ? '숨겨진 도전과제' : null,
    achievement.requiresDlc ? 'DLC 필요' : '본편만으로 가능',
    achievement.requiresMultiplayer ? '멀티플레이 필요' : '싱글 플레이 가능',
    achievement.isMissable ? '놓치기 쉬움' : '상시 도전 가능',
    achievement.requiresSecondRun ? '2회차 필요' : '1회차 가능',
  ].filter(
    (label): label is string =>
      Boolean(label) && !achievement.tags.includes(String(label)),
  )
}

export function AchievementDetailPage() {
  const { achievementId } = useParams()
  const location = useLocation()
  const achievementIdNumber = Number(achievementId)
  const stateAchievement = (location.state as AchievementLocationState | null)
    ?.achievement
  const matchingStateAchievement =
    stateAchievement?.id === achievementIdNumber ? stateAchievement : undefined
  const inferredGameId = getSteamOnlyGameId(achievementIdNumber)

  const {
    data: queriedAchievement,
    isError: isAchievementError,
    isLoading: isAchievementLoading,
  } = useAchievementDetailQuery(achievementIdNumber)
  const lookupGameId =
    queriedAchievement?.gameId ?? matchingStateAchievement?.gameId ?? inferredGameId
  const {
    data: game,
    isLoading: isGameLoading,
  } = useGameDetailQuery(lookupGameId)
  const {
    data: relatedGuides = [],
    isLoading: isGuidesLoading,
  } = useAchievementGuidesQuery(achievementIdNumber)

  const achievement = queriedAchievement ?? matchingStateAchievement
  const displayTags = achievement ? getDisplayTags(achievement) : []
  const noticeLabels = achievement ? getNoticeLabels(achievement) : []
  const userGuides = useGuideStore((state) => state.userGuides)
  const deleteGuide = useGuideStore((state) => state.deleteGuide)
  const votes = useVoteStore((state) => state.votes)
  const combinedGuides = [
    ...userGuides.filter((guide) => guide.achievementId === achievementIdNumber),
    ...relatedGuides,
  ]
  const isResolvingSteamAchievement =
    !achievement &&
    Number.isFinite(inferredGameId) &&
    (isAchievementLoading || isGameLoading)

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
            공략이 등록되어 있으면 힌트, 자세한 공략, 스포일러 포함 단계로
            나누어 보여줍니다.
          </p>
        </div>
        {isGuidesLoading && <LoadingState message="공략을 불러오는 중입니다." />}
        {!isGuidesLoading &&
          combinedGuides.map((guide) => (
            <SpoilerGuideTabs
              guide={guide}
              key={`${guide.source ?? 'local'}-${guide.id}`}
              onDelete={
                guide.source === 'user' ? () => deleteGuide(guide.id) : undefined
              }
            />
          ))}
        {!isGuidesLoading && combinedGuides.length === 0 && (
          <div className="empty-state">
            <h3>등록된 공략이 없습니다.</h3>
            <p className="muted">
              이 도전과제의 힌트와 조건을 직접 정리해볼 수 있습니다.
            </p>
            <Link
              className="button-link"
              state={{ achievement }}
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
