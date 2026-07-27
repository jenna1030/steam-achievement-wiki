import { Link, useParams } from 'react-router-dom'
import { achievements } from '../mocks/achievements'
import { guides } from '../mocks/guides'
import { games } from '../mocks/games'

export function AchievementDetailPage() {
  const { achievementId } = useParams()
  const achievement = achievements.find(
    (item) => item.id === Number(achievementId),
  )

  if (!achievement) {
    return (
      <main className="page">
        <section className="empty-state">
          <h1>도전과제를 찾을 수 없습니다.</h1>
          <Link className="button-link" to="/games">
            게임 목록으로
          </Link>
        </section>
      </main>
    )
  }

  const game = games.find((item) => item.id === achievement.gameId)
  const relatedGuides = guides.filter(
    (guide) => guide.achievementId === achievement.id,
  )

  return (
    <main className="page">
      <section className="page-header">
        <p className="eyebrow">{game?.title ?? 'Achievement'}</p>
        <h1>{achievement.title}</h1>
        <p className="muted">{achievement.description}</p>
      </section>

      <section className="info-grid">
        <article>
          <strong>{achievement.globalRate}%</strong>
          <span>전체 유저 달성률</span>
        </article>
        <article>
          <strong>{achievement.estimatedMinutes}분</strong>
          <span>예상 소요 시간</span>
        </article>
        <article>
          <strong>{achievement.isMissable ? '주의' : '일반'}</strong>
          <span>놓치기 쉬움 여부</span>
        </article>
      </section>

      <section className="section embedded-section">
        <div className="section-heading">
          <p className="eyebrow">Guides</p>
          <h2>스포일러 단계별 공략</h2>
        </div>
        {relatedGuides.length > 0 ? (
          relatedGuides.map((guide) => (
            <article className="guide-card" key={guide.id}>
              <p>{guide.author}</p>
              <h3>{guide.title}</h3>
              <div className="spoiler-columns">
                <div>
                  <strong>힌트</strong>
                  <span>{guide.hint}</span>
                </div>
                <div>
                  <strong>자세한 공략</strong>
                  <span>{guide.detail}</span>
                </div>
                <div>
                  <strong>스포일러 포함</strong>
                  <span>{guide.spoiler}</span>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <h3>아직 등록된 공략이 없습니다.</h3>
            <Link className="button-link" to="/guides/new">
              공략 작성하기
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
