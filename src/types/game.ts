export interface Game {
  id: number
  steamAppId: number
  title: string
  description: string
  genre: string
  developer: string
  publisher: string
  releaseDate: string
  image: string
  storeUrl: string
  achievementCount: number
  hasAchievements: boolean
}
