import { Link } from 'react-router-dom'
import { games } from '../mocks/games'

export function GameSearchPage() {
  return (
    <main className="page">
      <section className="page-header">
        <p className="eyebrow">Game Search</p>
        <h1>게임 검색</h1>
        <p className="muted">
          Steam 도전과제가 있는 게임을 찾고, 관심 게임으로 등록할 수 있는
          페이지입니다.
        </p>
      </section>

      <section className="toolbar" aria-label="게임 검색 필터">
        <input type="search" placeholder="게임명을 입력하세요" />
        <select defaultValue="all" aria-label="장르 필터">
          <option value="all">전체 장르</option>
          <option value="action">액션</option>
          <option value="simulation">시뮬레이션</option>
        </select>
        <button type="button">검색</button>
      </section>

      <section className="game-grid">
        {games.map((game) => (
          <article className="game-card" key={game.id}>
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
                <button type="button">관심 게임</button>
                <Link className="text-link" to={`/games/${game.id}`}>
                  상세 보기
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
