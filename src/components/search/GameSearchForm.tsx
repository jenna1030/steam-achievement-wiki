import type { FormEvent } from 'react'
import type { GameSearchFilters } from '../../types/search'

interface GameSearchFormProps {
  filters: GameSearchFilters
  genres: string[]
  resultCount: number
  onChange: (filters: GameSearchFilters) => void
  onSubmit: () => void
}

export function GameSearchForm({
  filters,
  genres,
  resultCount,
  onChange,
  onSubmit,
}: GameSearchFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="toolbar search-toolbar" onSubmit={handleSubmit}>
      <label>
        <span>게임명</span>
        <input
          type="search"
          value={filters.query}
          placeholder="게임명을 입력하세요"
          onChange={(event) =>
            onChange({ ...filters, query: event.target.value })
          }
        />
      </label>
      <label>
        <span>장르</span>
        <select
          value={filters.genre}
          aria-label="장르 필터"
          onChange={(event) =>
            onChange({ ...filters, genre: event.target.value })
          }
        >
          <option value="all">전체 장르</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>도전과제</span>
        <select
          value={filters.achievementFilter}
          aria-label="도전과제 유무 필터"
          onChange={(event) =>
            onChange({
              ...filters,
              achievementFilter: event.target.value as GameSearchFilters['achievementFilter'],
            })
          }
        >
          <option value="all">전체 게임</option>
          <option value="with-achievements">도전과제 있음</option>
        </select>
      </label>
      <button type="submit">검색</button>
      <p className="result-count">{resultCount}개 게임</p>
    </form>
  )
}
