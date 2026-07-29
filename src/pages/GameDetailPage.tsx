import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AchievementCard } from '../components/achievement/AchievementCard'
import { AchievementFilterBar } from '../components/achievement/AchievementFilterBar'
import { CompletionBadge } from '../components/common/CompletionBadge'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { useAchievementsQuery } from '../hooks/useAchievementsQuery'
import { useGameDetailQuery } from '../hooks/useGameDetailQuery'
import { useSteamPlayerAchievementsQuery } from '../hooks/useSteamPlayerAchievementsQuery'
import { useAuthStore } from '../stores/authStore'
import { useGuideStore } from '../stores/guideStore'
import type { AchievementSortOption } from '../types/achievement'
import {
  filterAchievements,
  getAchievementFilterTags,
  sortAchievements,
} from '../utils/achievementFilters'
import { applyGuideMetadata } from '../utils/achievementMetadata'
import { isGuideOwnedBy } from '../utils/guideOwnership'

export function GameDetailPage() {
  const { gameId } = useParams()
  const gameIdNumber = Number(gameId)
  const [sortOption, setSortOption] =
    useState<AchievementSortOption>('rate-desc')
  const [selectedTag, setSelectedTag] = useState('all')
  const [showHidden, setShowHidden] = useState(false)
  const user = useAuthStore((state) => state.user)
  const {
    data: game,
    error: gameError,
    isError: isGameError,
    isLoading: isGameLoading,
  } = useGameDetailQuery(gameIdNumber)
  const {
    data: steamAchievements = [],
    isError: isAchievementsError,
    isLoading: isAchievementsLoading,
  } = useAchievementsQuery(gameIdNumber)
  const {
    data: playerProgress,
    isLoading: isPlayerProgressLoading,
  } = useSteamPlayerAchievementsQuery(user?.steamId, gameIdNumber)
  const playerAchievementsByName = useMemo(
    () =>
      new Map(
        playerProgress?.achievements.map((achievement) => [
          achievement.name,
          achievement,
        ]) ?? [],
      ),
    [playerProgress?.achievements],
  )
  const userGuides = useGuideStore((state) => state.userGuides)
  const achievements = useMemo(
    () =>
      steamAchievements.map((achievement) => {
        const legacyId = String(achievement.legacyId ?? '')
        const guide = userGuides.find(
          (item) =>
            isGuideOwnedBy(item, user?.steamId) &&
            (item.achievementId === achievement.id ||
              item.achievementId === legacyId),
        )

        return applyGuideMetadata(achievement, guide)
      }),
    [steamAchievements, user?.steamId, userGuides],
  )
  const achievementTags = useMemo(
    () => getAchievementFilterTags(achievements),
    [achievements],
  )
  const visibleAchievements = useMemo(() => {
    const filteredAchievements = filterAchievements(
      achievements,
      selectedTag,
      showHidden,
    )

    return sortAchievements(filteredAchievements, sortOption)
  }, [achievements, selectedTag, showHidden, sortOption])
  const averageRate =
    achievements.length > 0
      ? Math.round(
          achievements.reduce(
            (total, achievement) => total + achievement.globalRate,
            0,
          ) / achievements.length,
        )
      : 0

  if (isGameLoading) {
    return (
      <main className="page">
        <LoadingState message="게임 상세 정보를 불러오는 중입니다." />
      </main>
    )
  }

  if (isGameError) {
    return (
      <main className="page">
        <ErrorState
          message={
            gameError instanceof Error
              ? gameError.message
              : 'Steam 앱 정보를 불러오지 못했습니다. API 서버가 켜져 있는지 확인해주세요.'
          }
          title="게임 정보를 가져오지 못했습니다."
        />
      </main>
    )
  }

  if (!game) {
    return (
      <main className="page">
        <section className="empty-state">
          <h1>게임을 찾을 수 없습니다.</h1>
          <Link className="button-link" to="/games">
            게임 목록으로
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="detail-hero">
        <img src={game.image} alt={`${game.title} 대표 이미지`} />
        <div>
          <p className="eyebrow">Steam App #{game.steamAppId}</p>
          <h1>{game.title}</h1>
          {playerProgress?.isPerfect && (
            <div className="game-completion-badge">
              <img
                aria-hidden="true"
                src="/assets/completion-medal.png"
              />
              <div>
                <strong>100% 완료</strong>
                <span>이 게임의 도전과제를 모두 달성했습니다.</span>
              </div>
            </div>
          )}
          <p className="muted">{game.description}</p>
          <dl>
            <div>
              <dt>장르</dt>
              <dd>{game.genre}</dd>
            </div>
            <div>
              <dt>출시일</dt>
              <dd>{game.releaseDate}</dd>
            </div>
            <div>
              <dt>개발사</dt>
              <dd>{game.developer}</dd>
            </div>
            <div>
              <dt>배급사</dt>
              <dd>{game.publisher}</dd>
            </div>
            <div>
              <dt>도전과제</dt>
              <dd>{achievements.length}개</dd>
            </div>
            <div>
              <dt>평균 달성률</dt>
              <dd>{averageRate}%</dd>
            </div>
          </dl>
          <a className="text-link" href={game.storeUrl} target="_blank">
            Steam 상점 바로가기
          </a>
        </div>
      </section>

      <section className="section embedded-section">
        <div className="achievement-section-heading">
          <div className="section-heading">
            <p className="eyebrow">Achievements</p>
            <h2>도전과제 목록</h2>
          </div>
          {user && isPlayerProgressLoading && (
            <p className="personal-achievement-summary" role="status">
              내 달성 현황 확인 중…
            </p>
          )}
          {user && playerProgress?.supported && (
            <p className="personal-achievement-summary">
              내 달성 현황{' '}
              <strong>
                {playerProgress.achievedCount} / {playerProgress.totalCount}
              </strong>
              {playerProgress.isPerfect && (
                <CompletionBadge label="완전 공략" />
              )}
            </p>
          )}
          {user &&
            !isPlayerProgressLoading &&
            playerProgress &&
            !playerProgress.supported && (
              <p className="personal-achievement-summary muted">
                이 게임의 개인 달성 정보는 비공개이거나 제공되지 않습니다.
              </p>
            )}
        </div>
        {isAchievementsLoading && (
          <LoadingState message="도전과제 목록을 불러오는 중입니다." />
        )}
        {isAchievementsError && (
          <ErrorState
            message="Steam API 서버를 실행한 뒤 다시 확인해주세요."
            title="도전과제를 가져오지 못했습니다."
          />
        )}
        {!isAchievementsLoading && !isAchievementsError && (
          <AchievementFilterBar
            resultCount={visibleAchievements.length}
            selectedTag={selectedTag}
            showHidden={showHidden}
            sortOption={sortOption}
            tags={achievementTags}
            onShowHiddenChange={setShowHidden}
            onSortChange={setSortOption}
            onTagChange={setSelectedTag}
          />
        )}
        {!isAchievementsLoading &&
        !isAchievementsError &&
        visibleAchievements.length > 0 ? (
          <div className="achievement-list">
            {visibleAchievements.map((achievement) => (
              <AchievementCard
                achievement={achievement}
                isUnlocked={
                  achievement.steamAchievementName
                    ? playerAchievementsByName.get(
                        achievement.steamAchievementName,
                      )?.achieved
                    : false
                }
                key={achievement.id}
                unlockTime={
                  achievement.steamAchievementName
                    ? playerAchievementsByName.get(
                        achievement.steamAchievementName,
                      )?.unlockTime
                    : undefined
                }
              />
            ))}
          </div>
        ) : null}
        {!isAchievementsLoading &&
        !isAchievementsError &&
        visibleAchievements.length === 0 ? (
          <div className="empty-state">
            <h3>표시할 도전과제가 없습니다.</h3>
            <p className="muted">
              이 게임이 Steam 공개 도전과제 정보를 제공하지 않을 수 있습니다.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  )
}
