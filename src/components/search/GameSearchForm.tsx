import { useMemo, useState, type FormEvent, type FocusEvent } from 'react'
import type { GameSearchFilters } from '../../types/search'

interface GameSearchFormProps {
  filters: GameSearchFilters
  classifications: string[]
  resultCount: number
  onChange: (filters: GameSearchFilters) => void
  onSubmit: () => void
}

export function GameSearchForm({
  filters,
  classifications,
  resultCount,
  onChange,
  onSubmit,
}: GameSearchFormProps) {
  const [genreSearchQuery, setGenreSearchQuery] = useState('')
  const [isGenreListOpen, setIsGenreListOpen] = useState(false)
  const visibleClassifications = useMemo(() => {
    const normalizedQuery = genreSearchQuery.trim().toLocaleLowerCase('ko')
    return normalizedQuery
      ? classifications.filter((classification) =>
          classification.toLocaleLowerCase('ko').includes(normalizedQuery),
        )
      : classifications
  }, [classifications, genreSearchQuery])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }
  const handleClassificationSelect = (classification: string) => {
    onChange({ ...filters, genre: classification })
    setGenreSearchQuery(classification === 'all' ? '' : classification)
    setIsGenreListOpen(false)
  }
  const handleGenreBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return
    }

    setIsGenreListOpen(false)
    setGenreSearchQuery(filters.genre === 'all' ? '' : filters.genre)
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
      <div className="genre-combobox" onBlur={handleGenreBlur}>
        <label htmlFor="genre-combobox-input">장르·태그</label>
        <input
          id="genre-combobox-input"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="genre-combobox-list"
          aria-expanded={isGenreListOpen}
          value={genreSearchQuery}
          placeholder={
            filters.genre === 'all'
              ? '장르·태그 검색'
              : `${filters.genre} 선택됨`
          }
          onChange={(event) => {
            setGenreSearchQuery(event.target.value)
            setIsGenreListOpen(true)
          }}
          onFocus={() => {
            setGenreSearchQuery('')
            setIsGenreListOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsGenreListOpen(false)
              setGenreSearchQuery(
                filters.genre === 'all' ? '' : filters.genre,
              )
            }

            if (
              event.key === 'Enter' &&
              visibleClassifications.length === 1
            ) {
              event.preventDefault()
              handleClassificationSelect(visibleClassifications[0])
            }
          }}
        />
        {isGenreListOpen && (
          <div
            className="genre-combobox-list"
            id="genre-combobox-list"
            role="listbox"
            aria-label="장르·태그 검색 결과"
          >
            {!genreSearchQuery.trim() && (
              <button
                className="genre-combobox-option"
                type="button"
                role="option"
                aria-selected={filters.genre === 'all'}
                onClick={() => handleClassificationSelect('all')}
              >
                전체 장르·태그
              </button>
            )}
            {visibleClassifications.map((classification) => (
              <button
                className="genre-combobox-option"
                key={classification}
                type="button"
                role="option"
                aria-selected={filters.genre === classification}
                onClick={() => handleClassificationSelect(classification)}
              >
                {classification}
              </button>
            ))}
            {classifications.length > 0 &&
              visibleClassifications.length === 0 && (
              <p className="genre-combobox-empty">
                일치하는 장르·태그가 없습니다.
              </p>
            )}
          </div>
        )}
      </div>
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
