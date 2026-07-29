import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AchievementCard } from '../components/achievement/AchievementCard'
import { AchievementFilterBar } from '../components/achievement/AchievementFilterBar'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { useAchievementsQuery } from '../hooks/useAchievementsQuery'
import { useGameDetailQuery } from '../hooks/useGameDetailQuery'
import type { AchievementSortOption } from '../types/achievement'
import {
  filterAchievements,
  getAchievementTags,
  sortAchievements,
} from '../utils/achievementFilters'

export function GameDetailPage() {
  const { gameId } = useParams()
  const gameIdNumber = Number(gameId)
  const [sortOption, setSortOption] =
    useState<AchievementSortOption>('rate-desc')
  const [selectedTag, setSelectedTag] = useState('all')
  const [showHidden, setShowHidden] = useState(false)
  const {
    data: game,
    isError: isGameError,
    isLoading: isGameLoading,
  } = useGameDetailQuery(gameIdNumber)
  const {
    data: achievements = [],
    isError: isAchievementsError,
    isFetching: isAchievementsFetching,
    isLoading: isAchievementsLoading,
  } = useAchievementsQuery(gameIdNumber)
  const achievementTags = useMemo(
    () => getAchievementTags(achievements),
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
          message="Steam 앱 정보를 불러오지 못했습니다. API 서버가 켜져 있는지 확인해주세요."
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
          <p className="muted">{game.description}</p>
          <dl>
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

      <section className="api-status-panel" aria-label="Steam API 연결 상태">
        <div>
          <p className="eyebrow">Steam API</p>
          <h2>공식 도전과제 데이터</h2>
          <p className="muted">
            Steam Web API에서 도전과제 이름, 설명, 숨김 여부, 전체 유저
            달성률을 불러와 목록을 구성합니다.
          </p>
        </div>
        <div>
          {isAchievementsFetching && <span>연결 확인 중</span>}
          {!isAchievementsFetching && !isAchievementsError && (
            <strong>{achievements.length}개 항목</strong>
          )}
          {isAchievementsError && <strong>연결 실패</strong>}
        </div>
      </section>

      <section className="section embedded-section">
        <div className="section-heading">
          <p className="eyebrow">Achievements</p>
          <h2>도전과제 목록</h2>
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
              <AchievementCard achievement={achievement} key={achievement.id} />
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
