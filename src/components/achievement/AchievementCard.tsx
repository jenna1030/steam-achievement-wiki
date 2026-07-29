import { Link, useNavigate } from 'react-router-dom'
import type { Achievement } from '../../types/achievement'
import { getAchievementPath } from '../../utils/achievementIdentity'
import {
  getAchievementNotices,
  getAchievementTags,
} from '../../utils/achievementMetadata'

const difficultyLabel = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
  'very-hard': '매우 어려움',
}

interface AchievementCardProps {
  achievement: Achievement
  isUnlocked?: boolean
  unlockTime?: number
}

function formatUnlockDate(unlockTime: number) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
  }).format(new Date(unlockTime * 1000))
}

export function AchievementCard({
  achievement,
  isUnlocked,
  unlockTime,
}: AchievementCardProps) {
  const navigate = useNavigate()
  const detailUrl = getAchievementPath(achievement.id)
  const displayTags = getAchievementTags(achievement)
  const noticeLabels = getAchievementNotices(achievement)
  const openDetail = () => {
    navigate(detailUrl, { state: { achievement } })
  }

  return (
    <article
      className={`achievement-card clickable-card${
        isUnlocked ? ' is-unlocked' : ''
      }`}
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
      <div className="achievement-card-main">
        <img
          className="achievement-icon"
          src={achievement.iconUrl}
          alt=""
          loading="lazy"
        />
        <div>
          {isUnlocked && (
            <div className="achievement-unlocked-row">
              <strong>달성 완료</strong>
              {unlockTime ? <span>{formatUnlockDate(unlockTime)}</span> : null}
            </div>
          )}
          <p>{difficultyLabel[achievement.difficulty]}</p>
          <h3>{achievement.title}</h3>
          <p className="muted">{achievement.description}</p>
          <div className="tag-row">
            {displayTags.map((tag) => (
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
      <div className="inline-actions">
        <Link
          className="text-link"
          state={{ achievement }}
          to={detailUrl}
          onClick={(event) => event.stopPropagation()}
        >
          상세 보기
        </Link>
        <Link
          className="text-link"
          state={{ achievement }}
          to={`/guides/new?achievementId=${achievement.id}`}
          onClick={(event) => event.stopPropagation()}
        >
          공략 작성
        </Link>
      </div>
    </article>
  )
}
