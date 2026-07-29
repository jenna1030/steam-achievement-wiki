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
  const [activeGenreIndex, setActiveGenreIndex] = useState(0)
  const visibleClassifications = useMemo(() => {
    const normalizedQuery = genreSearchQuery.trim().toLocaleLowerCase('ko')
    return normalizedQuery
      ? classifications.filter((classification) =>
          classification.toLocaleLowerCase('ko').includes(normalizedQuery),
        )
      : classifications
  }, [classifications, genreSearchQuery])
  const genreOptions = useMemo(
    () => [
      ...(!genreSearchQuery.trim() ? ['all'] : []),
      ...visibleClassifications,
    ],
    [genreSearchQuery, visibleClassifications],
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }
  const handleClassificationSelect = (classification: string) => {
    onChange({ ...filters, genre: classification })
    setGenreSearchQuery(classification === 'all' ? '' : classification)
    setIsGenreListOpen(false)
    setActiveGenreIndex(0)
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
          aria-haspopup="listbox"
          aria-activedescendant={
            isGenreListOpen && genreOptions.length > 0
              ? `genre-combobox-option-${activeGenreIndex}`
              : undefined
          }
          value={genreSearchQuery}
          placeholder={
            filters.genre === 'all'
              ? '장르·태그 검색'
              : `${filters.genre} 선택됨`
          }
          onChange={(event) => {
            setGenreSearchQuery(event.target.value)
            setIsGenreListOpen(true)
            setActiveGenreIndex(0)
          }}
          onFocus={() => {
            setGenreSearchQuery('')
            setIsGenreListOpen(true)
            setActiveGenreIndex(0)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsGenreListOpen(false)
              setGenreSearchQuery(
                filters.genre === 'all' ? '' : filters.genre,
              )
              setActiveGenreIndex(0)
              return
            }

            if (event.key === 'ArrowDown' && genreOptions.length > 0) {
              event.preventDefault()
              setIsGenreListOpen(true)
              setActiveGenreIndex((currentIndex) =>
                currentIndex >= genreOptions.length - 1
                  ? 0
                  : currentIndex + 1,
              )
              return
            }

            if (event.key === 'ArrowUp' && genreOptions.length > 0) {
              event.preventDefault()
              setIsGenreListOpen(true)
              setActiveGenreIndex((currentIndex) =>
                currentIndex <= 0
                  ? genreOptions.length - 1
                  : currentIndex - 1,
              )
              return
            }

            if (
              event.key === 'Enter' &&
              isGenreListOpen &&
              genreOptions[activeGenreIndex]
            ) {
              event.preventDefault()
              handleClassificationSelect(genreOptions[activeGenreIndex])
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
            {genreOptions.map((classification, index) => (
              <button
                className={`genre-combobox-option${
                  index === activeGenreIndex ? ' is-active' : ''
                }`}
                id={`genre-combobox-option-${index}`}
                key={classification}
                type="button"
                role="option"
                aria-selected={filters.genre === classification}
                tabIndex={-1}
                onClick={() => handleClassificationSelect(classification)}
                onMouseEnter={() => setActiveGenreIndex(index)}
              >
                {classification === 'all'
                  ? '전체 장르·태그'
                  : classification}
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
      <p aria-live="polite" className="result-count">
        {resultCount}개 게임
      </p>
    </form>
  )
}
