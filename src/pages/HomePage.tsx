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

const roadmapItems = [
  '게임 검색과 관심 게임 등록',
  '도전과제 목록, 정렬, 태그 필터',
  '스포일러 단계별 공략 보기',
  '체크리스트와 난이도 투표',
]

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const {
    data: featuredGames = [],
    isError: isFeaturedGamesError,
    isLoading: isFeaturedGamesLoading,
  } = useFeaturedGamesQuery()
  const favoriteGameIds = useLibraryStore((state) => state.favoriteGameIds)
  const { data: firstGameAchievements = [] } = useAchievementsQuery(1)
  const { data: secondGameAchievements = [] } = useAchievementsQuery(2)
  const { data: thirdGameAchievements = [] } = useAchievementsQuery(3)
  const allAchievements = [
    ...firstGameAchievements,
    ...secondGameAchievements,
    ...thirdGameAchievements,
  ]
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
          <h1>깨고 싶은 도전과제를 공략과 체크리스트로 관리하세요.</h1>
          <p className="hero-description">
            Steam 게임의 도전과제를 살펴보고, 스포일러 단계별 공략과 난이도
            투표를 참고해 다음 목표를 정하는 개인 프로젝트입니다.
          </p>
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
              <button type="submit">
                검색
              </button>
            </div>
          </form>
        </div>
        <aside className="hero-summary" aria-label="서비스 요약">
          <div>
            <strong>1차 목표</strong>
            <span>검색, 상세, 공략, 체크리스트</span>
          </div>
          <div>
            <strong>데이터 전략</strong>
            <span>mock data 먼저, Steam API는 단계적으로</span>
          </div>
          <div>
            <strong>과제 포인트</strong>
            <span>TanStack Query 적용 예정</span>
          </div>
        </aside>
      </section>

      <section className="section" id="games">
        <div className="section-heading">
          <p className="eyebrow">Featured Games</p>
          <h2>도전과제를 확인할 게임</h2>
        </div>
        {isFeaturedGamesLoading && <LoadingState message="인기 게임을 불러오는 중입니다." />}
        {isFeaturedGamesError && <ErrorState />}
        {!isFeaturedGamesLoading && !isFeaturedGamesError && (
          <div className="game-grid">
            {featuredGames.map((game) => (
              <Link
                className="game-card clickable-card"
                key={game.id}
                to={`/games/${game.id}`}
              >
                <img src={game.image} alt={`${game.title} 대표 이미지`} />
                <div className="game-card-body">
                  <p>{game.genre}</p>
                  <h3>{game.title}</h3>
                  <dl>
                    <div>
                      <dt>도전과제</dt>
                      <dd>{game.achievementCount}개</dd>
                    </div>
                    <div>
                      <dt>평균 달성률</dt>
                      <dd>{game.averageRate}%</dd>
                    </div>
                  </dl>
                  <span className="text-link">
                    상세 보기
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="section split-section" id="achievements">
        <div className="section-heading">
          <p className="eyebrow">Easy Picks</p>
          <h2>가볍게 시작할 도전과제</h2>
          <p className="muted">
            달성률, 예상 소요 시간, 난이도 투표를 기준으로 추천하는
            영역입니다.
          </p>
        </div>
        <EasyAchievementList recommendations={recommendations} />
      </section>

      <section className="section">
        <AchievementRateChart achievements={allAchievements} />
      </section>

      <section className="section roadmap" id="roadmap">
        <div className="section-heading">
          <p className="eyebrow">Next Build</p>
          <h2>다음 구현 순서</h2>
        </div>
        <ol>
          {roadmapItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
    </>
  )
}
