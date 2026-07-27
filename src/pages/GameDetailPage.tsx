import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AchievementCard } from '../components/achievement/AchievementCard'
import { AchievementFilterBar } from '../components/achievement/AchievementFilterBar'
import { achievements } from '../mocks/achievements'
import { games } from '../mocks/games'
import type { AchievementSortOption } from '../types/achievement'
import {
  filterAchievements,
  getAchievementTags,
  sortAchievements,
} from '../utils/achievementFilters'

export function GameDetailPage() {
  const { gameId } = useParams()
  const gameIdNumber = Number(gameId)
  const [sortOption, setSortOption] =
    useState<AchievementSortOption>('rate-desc')
  const [selectedTag, setSelectedTag] = useState('all')
  const [showHidden, setShowHidden] = useState(false)
  const game = games.find((item) => item.id === gameIdNumber)

  const gameAchievements = useMemo(
    () =>
      achievements.filter((achievement) => achievement.gameId === gameIdNumber),
    [gameIdNumber],
  )
  const achievementTags = useMemo(
    () => getAchievementTags(gameAchievements),
    [gameAchievements],
  )
  const visibleAchievements = useMemo(() => {
    const filteredAchievements = filterAchievements(
      gameAchievements,
      selectedTag,
      showHidden,
    )

    return sortAchievements(filteredAchievements, sortOption)
  }, [gameAchievements, selectedTag, showHidden, sortOption])

  if (!game) {
    return (
      <main className="page">
        <section className="empty-state">
          <h1>게임을 찾을 수 없습니다.</h1>
          <Link className="button-link" to="/games">
            게임 목록으로
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="detail-hero">
        <img src={game.image} alt={`${game.title} 대표 이미지`} />
        <div>
          <p className="eyebrow">{game.genre}</p>
          <h1>{game.title}</h1>
          <p className="muted">{game.description}</p>
          <dl>
            <div>
              <dt>출시일</dt>
              <dd>{game.releaseDate}</dd>
            </div>
            <div>
              <dt>개발사</dt>
              <dd>{game.developer}</dd>
            </div>
            <div>
              <dt>배급사</dt>
              <dd>{game.publisher}</dd>
            </div>
          </dl>
          <a className="text-link" href={game.storeUrl} target="_blank">
            Steam 상점 바로가기
          </a>
        </div>
      </section>

      <section className="section embedded-section">
        <div className="section-heading">
          <p className="eyebrow">Achievements</p>
          <h2>도전과제 목록</h2>
        </div>
        <AchievementFilterBar
          resultCount={visibleAchievements.length}
          selectedTag={selectedTag}
          showHidden={showHidden}
          sortOption={sortOption}
          tags={achievementTags}
          onShowHiddenChange={setShowHidden}
          onSortChange={setSortOption}
          onTagChange={setSelectedTag}
        />
        {visibleAchievements.length > 0 ? (
          <div className="achievement-list">
            {visibleAchievements.map((achievement) => (
              <AchievementCard achievement={achievement} key={achievement.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>조건에 맞는 도전과제가 없습니다.</h3>
            <p className="muted">
              태그를 전체로 바꾸거나 숨겨진 도전과제 표시를 켜보세요.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
