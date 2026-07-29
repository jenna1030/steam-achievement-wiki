import { Link } from 'react-router-dom'
import type { RecommendedAchievementView } from '../../utils/recommendAchievements'
import { getAchievementPath } from '../../utils/achievementIdentity'
import { formatEstimatedTimeRange } from '../../utils/estimatedTime'

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
            <p>{game?.title ?? '게임 정보 없음'}</p>
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
              <dd>{formatEstimatedTimeRange(achievement.estimatedMinutes)}</dd>
            </div>
          </dl>
          <Link
            className="text-link"
            state={{ achievement }}
            to={getAchievementPath(achievement.id)}
          >
            상세 보기
          </Link>
        </article>
      ))}
    </div>
  )
}
