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
  const hasNotes =
    achievement.platformNotes.length > 0 || achievement.bugNotes.length > 0

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
          <strong>
            {achievement.estimatedMinutes > 0
              ? `${achievement.estimatedMinutes}분`
              : '정보 없음'}
          </strong>
          <span>예상 소요 시간</span>
        </article>
      </section>

      {hasNotes && (
        <section className="meta-panel">
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
      )}
    </>
  )
}
