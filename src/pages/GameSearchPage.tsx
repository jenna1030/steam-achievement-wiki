import { useMemo, useState } from 'react'
import { GameCard } from '../components/game/GameCard'
import { GameSearchForm } from '../components/search/GameSearchForm'
import { games } from '../mocks/games'
import { useLibraryStore } from '../stores/libraryStore'
import type { GameSearchFilters } from '../types/search'
import { filterGames, getGameGenres } from '../utils/gameFilters'

export function GameSearchPage() {
  const [filters, setFilters] = useState<GameSearchFilters>({
    query: '',
    genre: 'all',
    achievementFilter: 'all',
  })
  const favoriteGameIds = useLibraryStore((state) => state.favoriteGameIds)
  const recentSearches = useLibraryStore((state) => state.recentSearches)
  const toggleFavoriteGame = useLibraryStore((state) => state.toggleFavoriteGame)
  const addRecentSearch = useLibraryStore((state) => state.addRecentSearch)

  const genres = useMemo(() => getGameGenres(games), [])
  const filteredGames = useMemo(
    () => filterGames(games, filters),
    [filters],
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
          <p className="muted">검색어를 줄이거나 장르 필터를 전체로 바꿔보세요.</p>
        </section>
      )}
    </main>
  )
}
