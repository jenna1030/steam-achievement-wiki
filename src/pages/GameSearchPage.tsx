import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LoadingState } from '../components/common/LoadingState'
import { GameSearchForm } from '../components/search/GameSearchForm'
import { useSteamStoreGamesQuery } from '../hooks/useSteamStoreGamesQuery'
import { useLibraryStore } from '../stores/libraryStore'
import type { GameSearchFilters } from '../types/search'

export function GameSearchPage() {
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('query') ?? ''
  const [filters, setFilters] = useState<GameSearchFilters>({
    query: initialQuery,
    genre: 'all',
    achievementFilter: 'all',
  })
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery)
  const favoriteGameIds = useLibraryStore((state) => state.favoriteGameIds)
  const recentSearches = useLibraryStore((state) => state.recentSearches)
  const toggleFavoriteGame = useLibraryStore((state) => state.toggleFavoriteGame)
  const addRecentSearch = useLibraryStore((state) => state.addRecentSearch)
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = useSteamStoreGamesQuery(submittedQuery)
  const loadedGames = useMemo(
    () => data?.pages.flatMap((page) => page.apps) ?? [],
    [data],
  )
  const genres = useMemo(
    () =>
      Array.from(
        new Set(loadedGames.flatMap((game) => game.genres ?? [])),
      ).sort((a, b) => a.localeCompare(b, 'ko')),
    [loadedGames],
  )
  const games = useMemo(
    () =>
      loadedGames.filter((game) => {
        const matchesGenre =
          filters.genre === 'all' || game.genres?.includes(filters.genre)
        const matchesAchievementFilter =
          filters.achievementFilter === 'all' || game.hasAchievements

        return matchesGenre && matchesAchievementFilter
      }),
    [filters.achievementFilter, filters.genre, loadedGames],
  )
  const totalCount = data?.pages[0]?.totalCount ?? 0
  const isFiltering =
    filters.genre !== 'all' || filters.achievementFilter !== 'all'

  return (
    <main className="page">
      <section className="page-header">
        <p className="eyebrow">Game Search</p>
        <h1>게임 검색</h1>
        <p className="muted">
          Steam Store 목록을 20개씩 가져오고, 카드를 누르면 appid 기반 상세
          페이지로 이동합니다.
        </p>
      </section>

      <GameSearchForm
        filters={filters}
        genres={genres}
        resultCount={games.length}
        onChange={setFilters}
        onSubmit={() => {
          const normalizedQuery = filters.query.trim()

          setSubmittedQuery(normalizedQuery)
          addRecentSearch(normalizedQuery)
        }}
      />

      <section className="search-summary" aria-label="검색 요약">
        <div>
          <strong>{favoriteGameIds.length}</strong>
          <span>관심 게임</span>
        </div>
        <div>
          <strong>{recentSearches.length}</strong>
          <span>최근 검색어</span>
        </div>
      </section>
      <p className="local-storage-note">
        관심 게임과 최근 검색어는 로그인 여부와 관계없이 현재 브라우저에만
        저장됩니다.
      </p>

      {recentSearches.length > 0 && (
        <section className="recent-searches" aria-label="최근 검색어">
          <strong>최근 검색어</strong>
          <div>
            {recentSearches.map((query) => (
              <button
                className="chip-button"
                key={query}
                type="button"
                onClick={() => {
                  setFilters({ ...filters, query })
                  setSubmittedQuery(query)
                }}
              >
                {query}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="steam-app-panel" aria-label="Steam Store 게임 목록">
        <div>
          <p className="eyebrow">Steam Store</p>
          <h2>{submittedQuery ? '검색 결과' : '상위 게임'}</h2>
          <p className="muted">
            {submittedQuery
              ? '검색어에 맞는 Steam Store 게임을 20개씩 불러옵니다.'
              : '검색어가 없으면 Steam Store 상위 게임을 먼저 보여줍니다.'}
          </p>
        </div>
        <span>
          {isFiltering
            ? `${games.length}개 표시 / ${loadedGames.length}개 불러옴`
            : `${loadedGames.length} / ${totalCount}개`}
        </span>
        {isLoading && <LoadingState message="Steam Store 목록을 불러오는 중입니다." />}
        {isError && (
          <p className="muted">
            {error instanceof Error
              ? error.message
              : 'Steam Store 목록을 불러오지 못했습니다. API 서버 실행 상태를 확인해주세요.'}
          </p>
        )}
        {games.length > 0 && (
          <div className="steam-game-grid">
            {games.map((game) => {
              const isFavorite = favoriteGameIds.includes(game.appid)

              return (
                <article className="steam-game-card" key={game.appid}>
                  <Link to={`/games/${game.appid}`}>
                    <img src={game.image} alt={`${game.name} 대표 이미지`} />
                    <div>
                      <p>
                        Steam App #{game.appid}
                        {game.releaseDate ? ` / ${game.releaseDate}` : ''}
                      </p>
                      <h3>{game.name}</h3>
                      <div className="game-genre-row">
                        {(game.genres?.length ?? 0) > 0 ? (
                          game.genres.slice(0, 3).map((genre) => (
                            <span key={genre}>{genre}</span>
                          ))
                        ) : (
                          <span>장르 정보 없음</span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <button
                    className={
                      isFavorite
                        ? 'secondary-button is-selected'
                        : 'secondary-button'
                    }
                    type="button"
                    onClick={() => toggleFavoriteGame(game.appid)}
                  >
                    {isFavorite ? '관심 해제' : '관심 게임'}
                  </button>
                </article>
              )
            })}
          </div>
        )}
        {!isLoading && games.length === 0 && !isError && (
          <p className="muted">Steam Store 결과가 없습니다.</p>
        )}
        {hasNextPage && (
          <button
            className="load-more-button"
            type="button"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage ? '불러오는 중' : '더보기'}
          </button>
        )}
      </section>
    </main>
  )
}
