import { Link, useParams } from 'react-router-dom'
import { achievements } from '../mocks/achievements'
import { games } from '../mocks/games'

const difficultyLabel = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
  'very-hard': '매우 어려움',
}

export function GameDetailPage() {
  const { gameId } = useParams()
  const game = games.find((item) => item.id === Number(gameId))

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

  const gameAchievements = achievements.filter(
    (achievement) => achievement.gameId === game.id,
  )

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
        <div className="toolbar" aria-label="도전과제 정렬과 필터">
          <select defaultValue="rate-desc" aria-label="정렬">
            <option value="rate-desc">달성률 높은 순</option>
            <option value="rate-asc">달성률 낮은 순</option>
            <option value="name">이름순</option>
            <option value="difficulty">난이도순</option>
          </select>
          <select defaultValue="all" aria-label="태그 필터">
            <option value="all">전체 태그</option>
            <option value="easy">쉬움</option>
            <option value="missable">놓치기 쉬움</option>
          </select>
        </div>
        <div className="achievement-list">
          {gameAchievements.map((achievement) => (
            <article className="achievement-card" key={achievement.id}>
              <div>
                <p>{difficultyLabel[achievement.difficulty]}</p>
                <h3>{achievement.title}</h3>
                <p className="muted">{achievement.description}</p>
                <div className="tag-row">
                  {achievement.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <dl>
                <div>
                  <dt>달성률</dt>
                  <dd>{achievement.globalRate}%</dd>
                </div>
                <div>
                  <dt>예상 시간</dt>
                  <dd>{achievement.estimatedMinutes}분</dd>
                </div>
              </dl>
              <Link className="text-link" to={`/achievements/${achievement.id}`}>
                상세 보기
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
