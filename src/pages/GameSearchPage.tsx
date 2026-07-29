import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { GameCard } from '../components/game/GameCard'
import { GameSearchForm } from '../components/search/GameSearchForm'
import { useGamesQuery } from '../hooks/useGamesQuery'
import { useSteamAppsQuery } from '../hooks/useSteamAppsQuery'
import { useLibraryStore } from '../stores/libraryStore'
import type { GameSearchFilters } from '../types/search'
import { filterGames, getGameGenres } from '../utils/gameFilters'

export function GameSearchPage() {
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('query') ?? ''
  const [filters, setFilters] = useState<GameSearchFilters>({
    query: initialQuery,
    genre: 'all',
    achievementFilter: 'all',
  })
  const favoriteGameIds = useLibraryStore((state) => state.favoriteGameIds)
  const recentSearches = useLibraryStore((state) => state.recentSearches)
  const toggleFavoriteGame = useLibraryStore((state) => state.toggleFavoriteGame)
  const addRecentSearch = useLibraryStore((state) => state.addRecentSearch)
  const { data: games = [], isError, isLoading } = useGamesQuery()
  const {
    data: steamApps = [],
    isError: isSteamAppsError,
    isFetching: isSteamAppsFetching,
  } = useSteamAppsQuery(filters.query)

  const genres = useMemo(() => getGameGenres(games), [games])
  const filteredGames = useMemo(
    () => filterGames(games, filters),
    [filters, games],
  )
  const gamesBySteamAppId = useMemo(
    () => new Map(games.map((game) => [game.steamAppId, game])),
    [games],
  )

  return (
    <main className="page">
      <section className="page-header">
        <p className="eyebrow">Game Search</p>
        <h1>게임 검색</h1>
        <p className="muted">
          Steam 도전과제가 있는 게임을 찾고, 관심 게임으로 등록할 수 있는
          페이지입니다.
        </p>
      </section>

      {isLoading && <LoadingState message="게임 목록을 불러오는 중입니다." />}
      {isError && <ErrorState />}
      {!isLoading && !isError && (
        <>
          <GameSearchForm
            filters={filters}
            genres={genres}
            resultCount={filteredGames.length}
            onChange={setFilters}
            onSubmit={() => addRecentSearch(filters.query)}
          />

          <section className="search-summary" aria-label="검색 요약">
            <div>
              <strong>{favoriteGameIds.length}</strong>
              <span>관심 게임</span>
            </div>
            <div>
              <strong>{recentSearches.length}</strong>
              <span>최근 검색</span>
            </div>
          </section>

          {recentSearches.length > 0 && (
            <section className="recent-searches" aria-label="최근 검색어">
              <strong>최근 검색어</strong>
              <div>
                {recentSearches.map((query) => (
                  <button
                    className="chip-button"
                    key={query}
                    type="button"
                    onClick={() => setFilters({ ...filters, query })}
                  >
                    {query}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="steam-app-panel" aria-label="Steam 앱 목록 검색">
            <div>
              <p className="eyebrow">Steam App List</p>
              <h2>Steam 앱 검색 결과</h2>
              <p className="muted">
                백엔드 프록시가 공식 Steam 앱 목록 API를 호출해 검색 후보를
                보여줍니다. 등록된 게임은 바로 상세 페이지로 이동할 수
                있습니다.
              </p>
            </div>
            <span>API Key 비노출</span>
            {filters.query.trim().length < 2 && (
              <p className="muted">두 글자 이상 입력하면 Steam 앱을 검색합니다.</p>
            )}
            {isSteamAppsFetching && (
              <p className="muted">Steam 앱 목록을 검색하는 중입니다.</p>
            )}
            {isSteamAppsError && (
              <p className="muted">
                Steam 앱 목록을 불러오지 못했습니다. `npm run dev:api`가
                실행 중인지 확인해주세요.
              </p>
            )}
            {steamApps.length > 0 && (
              <div className="steam-app-results">
                {steamApps.map((app) => {
                  const linkedGame = gamesBySteamAppId.get(app.appid)

                  return linkedGame ? (
                    <Link key={app.appid} to={`/games/${linkedGame.id}`}>
                      {app.name} <small>#{app.appid}</small>
                    </Link>
                  ) : (
                    <span key={app.appid}>
                      {app.name} <small>#{app.appid}</small>
                    </span>
                  )
                })}
              </div>
            )}
            {!isSteamAppsFetching &&
              filters.query.trim().length >= 2 &&
              steamApps.length === 0 &&
              !isSteamAppsError && (
                <p className="muted">Steam 앱 검색 결과가 없습니다.</p>
              )}
          </section>

          {filteredGames.length > 0 ? (
            <section className="game-grid">
              {filteredGames.map((game) => (
                <GameCard
                  game={game}
                  isFavorite={favoriteGameIds.includes(game.id)}
                  key={game.id}
                  onToggleFavorite={toggleFavoriteGame}
                />
              ))}
            </section>
          ) : (
            <section className="empty-state">
              <h2>검색 결과가 없습니다.</h2>
              <p className="muted">
                검색어를 줄이거나 장르 필터를 전체로 바꿔보세요.
              </p>
            </section>
          )}
        </>
      )}
    </main>
  )
}
