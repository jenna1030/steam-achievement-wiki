import type { AchievementSortOption } from '../../types/achievement'

interface AchievementFilterBarProps {
  sortOption: AchievementSortOption
  selectedTag: string
  tags: string[]
  showHidden: boolean
  resultCount: number
  onSortChange: (sortOption: AchievementSortOption) => void
  onTagChange: (tag: string) => void
  onShowHiddenChange: (showHidden: boolean) => void
}

export function AchievementFilterBar({
  sortOption,
  selectedTag,
  tags,
  showHidden,
  resultCount,
  onSortChange,
  onTagChange,
  onShowHiddenChange,
}: AchievementFilterBarProps) {
  return (
    <div className="toolbar achievement-toolbar" aria-label="도전과제 정렬과 필터">
      <label>
        <span>정렬</span>
        <select
          value={sortOption}
          aria-label="정렬"
          onChange={(event) =>
            onSortChange(event.target.value as AchievementSortOption)
          }
        >
          <option value="rate-desc">달성률 높은 순</option>
          <option value="rate-asc">달성률 낮은 순</option>
          <option value="name">이름순</option>
          <option value="difficulty">난이도순</option>
        </select>
      </label>
      <label>
        <span>태그</span>
        <select
          value={selectedTag}
          aria-label="태그 필터"
          onChange={(event) => onTagChange(event.target.value)}
        >
          <option value="all">전체 태그</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </label>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={showHidden}
          onChange={(event) => onShowHiddenChange(event.target.checked)}
        />
        숨겨진 도전과제 표시
      </label>
      <p className="result-count">{resultCount}개 도전과제</p>
    </div>
  )
}
