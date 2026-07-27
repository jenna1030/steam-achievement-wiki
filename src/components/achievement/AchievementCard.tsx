import { Link } from 'react-router-dom'
import type { Achievement } from '../../types/achievement'

const difficultyLabel = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
  'very-hard': '매우 어려움',
}

interface AchievementCardProps {
  achievement: Achievement
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const isSteamOnly = achievement.source === 'steam'
  const noticeLabels = [
    isSteamOnly ? 'Steam API 항목' : null,
    achievement.isHidden ? '숨겨짐' : null,
    achievement.isMissable ? '놓치기 쉬움' : null,
    achievement.requiresSecondRun ? '2회차 필요' : null,
    achievement.requiresDlc ? 'DLC 필요' : null,
    achievement.requiresMultiplayer ? '멀티플레이 필요' : null,
  ].filter(Boolean)

  return (
    <article className="achievement-card">
      <div>
        <p>{difficultyLabel[achievement.difficulty]}</p>
        <h3>{achievement.title}</h3>
        <p className="muted">{achievement.description}</p>
        <div className="tag-row">
          {achievement.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        {noticeLabels.length > 0 && (
          <div className="notice-row">
            {noticeLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        )}
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
      {isSteamOnly ? (
        <span className="disabled-link">상세 정보 준비 중</span>
      ) : (
        <Link className="text-link" to={`/achievements/${achievement.id}`}>
          상세 보기
        </Link>
      )}
    </article>
  )
}
