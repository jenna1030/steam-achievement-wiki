import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AchievementCard } from '../components/achievement/AchievementCard'
import { AchievementFilterBar } from '../components/achievement/AchievementFilterBar'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { useAchievementsQuery } from '../hooks/useAchievementsQuery'
import { useGameDetailQuery } from '../hooks/useGameDetailQuery'
import { useSteamAchievementPercentagesQuery } from '../hooks/useSteamAchievementPercentagesQuery'
import type { AchievementSortOption } from '../types/achievement'
import {
  filterAchievements,
  getAchievementTags,
  sortAchievements,
} from '../utils/achievementFilters'
import { mergeSteamAchievements } from '../utils/steamAchievements'

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
    data: gameAchievements = [],
    isError: isAchievementsError,
    isLoading: isAchievementsLoading,
  } = useAchievementsQuery(gameIdNumber)
  const {
    data: steamAchievements = [],
    isError: isSteamError,
    isFetching: isSteamFetching,
    isSuccess: isSteamSuccess,
  } = useSteamAchievementPercentagesQuery(game?.steamAppId ?? Number.NaN)

  const mergedAchievements = useMemo(
    () => mergeSteamAchievements(gameAchievements, steamAchievements, gameIdNumber),
    [gameAchievements, gameIdNumber, steamAchievements],
  )
  const achievementTags = useMemo(
    () => getAchievementTags(mergedAchievements),
    [mergedAchievements],
  )
  const visibleAchievements = useMemo(() => {
    const filteredAchievements = filterAchievements(
      mergedAchievements,
      selectedTag,
      showHidden,
    )

    return sortAchievements(filteredAchievements, sortOption)
  }, [mergedAchievements, selectedTag, showHidden, sortOption])

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
        <ErrorState />
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
          <p className="eyebrow">{game.genre}</p>
          <h1>{game.title}</h1>
          <p className="muted">{game.description}</p>
          <dl>
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
          </dl>
          <a className="text-link" href={game.storeUrl} target="_blank">
            Steam 상점 바로가기
          </a>
        </div>
      </section>

      <section className="api-status-panel" aria-label="Steam API 연결 상태">
        <div>
          <p className="eyebrow">Steam API</p>
          <h2>공개 도전과제 달성률 연결 테스트</h2>
          <p className="muted">
            Vite 개발 서버 프록시를 통해 Steam 공개 API에서 글로벌 달성률을
            받아오고, 매칭되는 항목은 도전과제 목록의 달성률에 반영합니다.
          </p>
        </div>
        <div>
          {isSteamFetching && <span>연결 확인 중</span>}
          {isSteamSuccess && (
            <strong>{steamAchievements.length}개 항목 반영 가능</strong>
          )}
          {isSteamError && <strong>연결 실패</strong>}
          {!isSteamFetching && !isSteamError && !isSteamSuccess && (
            <span>대기 중</span>
          )}
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
        {isAchievementsError && <ErrorState />}
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
            <h3>조건에 맞는 도전과제가 없습니다.</h3>
            <p className="muted">
              태그를 전체로 바꾸거나 숨겨진 도전과제 표시를 켜보세요.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  )
}
