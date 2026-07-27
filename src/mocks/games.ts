import type { Game } from '../types/game'

export const games: Game[] = [
  {
    id: 1,
    steamAppId: 1145350,
    title: 'Hades II',
    description:
      '액션 로그라이크 전투를 반복하며 무기와 축복을 조합해 도전과제를 공략하는 게임입니다.',
    genre: 'Roguelike Action',
    developer: 'Supergiant Games',
    publisher: 'Supergiant Games',
    releaseDate: '2024-05-06',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145350/header.jpg',
    storeUrl: 'https://store.steampowered.com/app/1145350/Hades_II/',
    achievementCount: 49,
    averageRate: 34,
    hasAchievements: true,
    isPopular: true,
  },
  {
    id: 2,
    steamAppId: 413150,
    title: 'Stardew Valley',
    description:
      '농장, 채집, 낚시, 관계 이벤트를 진행하며 장기 체크리스트가 중요한 시뮬레이션 RPG입니다.',
    genre: 'Simulation RPG',
    developer: 'ConcernedApe',
    publisher: 'ConcernedApe',
    releaseDate: '2016-02-26',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg',
    storeUrl: 'https://store.steampowered.com/app/413150/Stardew_Valley/',
    achievementCount: 49,
    averageRate: 41,
    hasAchievements: true,
    isPopular: true,
  },
  {
    id: 3,
    steamAppId: 367520,
    title: 'Hollow Knight',
    description:
      '탐험과 보스전 비중이 높고 숨겨진 도전과제가 많아 스포일러 단계 조절이 필요한 게임입니다.',
    genre: 'Metroidvania',
    developer: 'Team Cherry',
    publisher: 'Team Cherry',
    releaseDate: '2017-02-24',
    image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg',
    storeUrl: 'https://store.steampowered.com/app/367520/Hollow_Knight/',
    achievementCount: 63,
    averageRate: 28,
    hasAchievements: true,
    isPopular: true,
  },
]

export const featuredGames = games.filter((game) => game.isPopular)
