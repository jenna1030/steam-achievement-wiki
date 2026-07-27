import type { Achievement } from '../../types/achievement'

const difficultyLabel = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
  'very-hard': '매우 어려움',
}

interface AchievementMetaPanelProps {
  achievement: Achievement
}

export function AchievementMetaPanel({
  achievement,
}: AchievementMetaPanelProps) {
  const notices = [
    achievement.requiresDlc ? 'DLC 필요' : '본편만으로 가능',
    achievement.requiresMultiplayer ? '멀티플레이 필요' : '싱글 플레이 가능',
    achievement.isMissable ? '놓치기 쉬움' : '상시 도전 가능',
    achievement.requiresSecondRun ? '2회차 필요' : '1회차 가능',
  ]

  return (
    <>
      <section className="info-grid">
        <article>
          <strong>{achievement.globalRate}%</strong>
          <span>전체 유저 달성률</span>
        </article>
        <article>
          <strong>{difficultyLabel[achievement.difficulty]}</strong>
          <span>체감 난이도</span>
        </article>
        <article>
          <strong>{achievement.estimatedMinutes}분</strong>
          <span>예상 소요 시간</span>
        </article>
      </section>

      <section className="meta-panel">
        <div>
          <p className="eyebrow">Tags</p>
          <div className="tag-row">
            {achievement.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow">Notices</p>
          <div className="notice-row">
            {notices.map((notice) => (
              <span key={notice}>{notice}</span>
            ))}
          </div>
        </div>
        {achievement.platformNotes.length > 0 && (
          <div>
            <p className="eyebrow">Platform</p>
            <ul className="note-list">
              {achievement.platformNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}
        {achievement.bugNotes.length > 0 && (
          <div>
            <p className="eyebrow">Bug Notes</p>
            <ul className="note-list">
              {achievement.bugNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  )
}
