import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AchievementRateChart } from '../components/chart/AchievementRateChart'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { EasyAchievementList } from '../components/recommendation/EasyAchievementList'
import { useAchievementsQuery } from '../hooks/useAchievementsQuery'
import { useFeaturedGamesQuery } from '../hooks/useGamesQuery'
import { useLibraryStore } from '../stores/libraryStore'
import { recommendEasyAchievements } from '../utils/recommendAchievements'

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const {
    data: featuredGames = [],
    isError: isFeaturedGamesError,
    isLoading: isFeaturedGamesLoading,
  } = useFeaturedGamesQuery()
  const favoriteGameIds = useLibraryStore((state) => state.favoriteGameIds)
  const firstGameAchievementsQuery = useAchievementsQuery(1145350)
  const secondGameAchievementsQuery = useAchievementsQuery(413150)
  const thirdGameAchievementsQuery = useAchievementsQuery(367520)
  const featuredAchievementQueries = [
    firstGameAchievementsQuery,
    secondGameAchievementsQuery,
    thirdGameAchievementsQuery,
  ]
  const allAchievements = featuredAchievementQueries.flatMap(
    (query) => query.data ?? [],
  )
  const isAchievementsLoading = featuredAchievementQueries.some(
    (query) => query.isLoading,
  )
  const recommendations = recommendEasyAchievements(
    allAchievements,
    featuredGames,
    favoriteGameIds,
  )

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedQuery = searchQuery.trim()

    navigate(
      normalizedQuery.length > 0
        ? `/games?query=${encodeURIComponent(normalizedQuery)}`
        : '/games',
    )
  }

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Steam 도전과제 공략 위키</p>
          <h1>Steam 도전과제를 검색하고 공략과 체크리스트로 관리하세요.</h1>
          <p className="hero-description">
            게임 appid를 기준으로 Steam 공개 도전과제와 전체 달성률을 불러오고,
            개인 공략과 진행 상태는 브라우저에 저장하는 개인 프로젝트입니다.
          </p>
        </div>
        <aside className="hero-search-column">
          <div>
            <p className="eyebrow">Quick Search</p>
            <h2>찾고 싶은 게임이 있나요?</h2>
            <p className="hero-search-description">
              게임명으로 검색하면 Steam AppID 기반 상세 페이지와 도전과제를
              바로 확인할 수 있습니다.
            </p>
          </div>
          <form
            className="search-panel"
            aria-label="게임 검색"
            onSubmit={handleSearchSubmit}
          >
            <label htmlFor="game-search">게임 검색</label>
            <div className="search-row">
              <input
                id="game-search"
                type="search"
                value={searchQuery}
                placeholder="예: Hollow Knight"
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <button type="submit">검색</button>
            </div>
          </form>
          <Link className="hero-all-games-link" to="/games">
            전체 게임과 장르 검색으로 이동
          </Link>
        </aside>
      </section>

      <section className="section" id="games">
        <div className="section-heading">
          <p className="eyebrow">Featured Games</p>
          <h2>도전과제를 확인할 게임</h2>
        </div>
        {isFeaturedGamesLoading && (
          <LoadingState message="Steam 게임 정보를 불러오는 중입니다." />
        )}
        {isFeaturedGamesError && (
          <ErrorState
            message="API 서버가 켜져 있는지 확인해주세요."
            title="Steam 게임 정보를 가져오지 못했습니다."
          />
        )}
        {!isFeaturedGamesLoading && !isFeaturedGamesError && (
          <div className="game-grid">
            {featuredGames.map((game) => {
              const achievements = allAchievements.filter(
                (achievement) => achievement.gameId === game.id,
              )
              const averageRate =
                achievements.length > 0
                  ? Math.round(
                      achievements.reduce(
                        (total, achievement) => total + achievement.globalRate,
                        0,
                      ) / achievements.length,
                    )
                  : 0

              return (
                <Link
                  className="game-card clickable-card"
                  key={game.id}
                  to={`/games/${game.id}`}
                >
                  <img src={game.image} alt={`${game.title} 대표 이미지`} />
                  <div className="game-card-body">
                    <p>Steam App #{game.steamAppId}</p>
                    <h3>{game.title}</h3>
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
                    <span className="text-link">상세 보기</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section className="section split-section" id="achievements">
        <div className="section-heading">
          <p className="eyebrow">Easy Picks</p>
          <h2>가볍게 시작할 도전과제</h2>
          <p className="muted">
            Steam 전체 달성률과 체감 난이도를 기준으로 시작하기 쉬운 항목을
            추천합니다.
          </p>
        </div>
        {isAchievementsLoading ? (
          <LoadingState message="추천 도전과제를 계산하는 중입니다." />
        ) : (
          <EasyAchievementList recommendations={recommendations} />
        )}
      </section>

      <section className="section">
        <AchievementRateChart
          achievements={allAchievements}
          games={featuredGames}
        />
      </section>
    </>
  )
}
