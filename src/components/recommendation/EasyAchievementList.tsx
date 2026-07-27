import { Link } from 'react-router-dom'
import type { RecommendedAchievementView } from '../../utils/recommendAchievements'

interface EasyAchievementListProps {
  recommendations: RecommendedAchievementView[]
}

export function EasyAchievementList({
  recommendations,
}: EasyAchievementListProps) {
  return (
    <div className="recommendation-list">
      {recommendations.map(({ achievement, game, reason }) => (
        <article className="recommendation-card" key={achievement.id}>
          <div>
            <p>{game?.title ?? 'Unknown Game'}</p>
            <h3>{achievement.title}</h3>
            <span>{reason}</span>
          </div>
          <dl>
            <div>
              <dt>달성률</dt>
              <dd>{achievement.globalRate}%</dd>
            </div>
            <div>
              <dt>예상 시간</dt>
              <dd>
                {achievement.estimatedMinutes > 0
                  ? `${achievement.estimatedMinutes}분`
                  : '정보 없음'}
              </dd>
            </div>
          </dl>
          {achievement.source === 'steam' ? (
            <span className="disabled-link">Steam API 항목</span>
          ) : (
            <Link className="text-link" to={`/achievements/${achievement.id}`}>
              공략 보기
            </Link>
          )}
        </article>
      ))}
    </div>
  )
}
