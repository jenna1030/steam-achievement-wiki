import type {
  Achievement,
  AchievementDifficulty,
  AchievementSortOption,
} from '../types/achievement'

const difficultyWeight: Record<AchievementDifficulty, number> = {
  easy: 1,
  normal: 2,
  hard: 3,
  'very-hard': 4,
}

export function getAchievementFilterTags(achievements: Achievement[]) {
  return Array.from(
    new Set(achievements.flatMap((achievement) => achievement.tags)),
  ).sort()
}

export function sortAchievements(
  achievements: Achievement[],
  sortOption: AchievementSortOption,
) {
  return [...achievements].sort((a, b) => {
    if (sortOption === 'rate-desc') {
      return b.globalRate - a.globalRate
    }

    if (sortOption === 'rate-asc') {
      return a.globalRate - b.globalRate
    }

    if (sortOption === 'difficulty') {
      return difficultyWeight[a.difficulty] - difficultyWeight[b.difficulty]
    }

    return a.title.localeCompare(b.title, 'ko')
  })
}

export function filterAchievements(
  achievements: Achievement[],
  tag: string,
  showHidden: boolean,
) {
  return achievements.filter((achievement) => {
    const matchesTag = tag === 'all' || achievement.tags.includes(tag)
    const matchesHidden = showHidden || !achievement.isHidden

    return matchesTag && matchesHidden
  })
}
