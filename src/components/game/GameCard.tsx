import { Link, useNavigate } from 'react-router-dom'
import type { Game } from '../../types/game'

interface GameCardProps {
  game: Game
  isFavorite: boolean
  onToggleFavorite: (gameId: number) => void
}

export function GameCard({
  game,
  isFavorite,
  onToggleFavorite,
}: GameCardProps) {
  const navigate = useNavigate()
  const detailUrl = `/games/${game.id}`

  const openDetail = () => {
    navigate(detailUrl)
  }

  return (
    <article
      className="game-card clickable-card"
      role="link"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openDetail()
        }
      }}
    >
      <img src={game.image} alt={`${game.title} 대표 이미지`} />
      <div className="game-card-body">
        <p>{game.genre}</p>
        <h2>{game.title}</h2>
        <p className="muted">{game.description}</p>
        <dl>
          <div>
            <dt>도전과제</dt>
            <dd>{game.achievementCount}개</dd>
          </div>
          <div>
            <dt>평균 달성률</dt>
            <dd>{game.averageRate}%</dd>
          </div>
        </dl>
        <div className="card-actions">
          <button
            className={isFavorite ? 'secondary-button is-selected' : 'secondary-button'}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onToggleFavorite(game.id)
            }}
          >
            {isFavorite ? '관심 해제' : '관심 게임'}
          </button>
          <Link
            className="text-link"
            to={detailUrl}
            onClick={(event) => event.stopPropagation()}
          >
            상세 보기
          </Link>
        </div>
      </div>
    </article>
  )
}
