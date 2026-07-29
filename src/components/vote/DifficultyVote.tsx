import { useVoteStore } from '../../stores/voteStore'
import type { AchievementId } from '../../types/achievement'

const voteOptions = [
  { key: 'easy', label: '쉬움' },
  { key: 'normal', label: '보통' },
  { key: 'hard', label: '어려움' },
  { key: 'veryHard', label: '매우 어려움' },
] as const

interface DifficultyVoteProps {
  achievementId: AchievementId
}

export function DifficultyVote({ achievementId }: DifficultyVoteProps) {
  const votes = useVoteStore((state) => state.votes)
  const userVotes = useVoteStore((state) => state.userVotes)
  const vote = useVoteStore((state) => state.vote)
  const removeVote = useVoteStore((state) => state.removeVote)
  const currentVote = votes.find((item) => item.achievementId === achievementId)
  const selectedVote = userVotes[achievementId]
  const totalVotes = currentVote
    ? currentVote.easy + currentVote.normal + currentVote.hard + currentVote.veryHard
    : 0

  return (
    <section className="vote-panel">
      <div>
        <p className="eyebrow">Difficulty Vote</p>
        <h2>체감 난이도 투표</h2>
        <p className="muted">
          공식 달성률과 별개로 직접 느낀 난이도를 남깁니다. 투표는 한 번만
          반영되며, 다른 항목을 누르면 기존 표가 이동합니다.
        </p>
      </div>
      <div className="vote-options">
        {voteOptions.map((option) => {
          const count = currentVote?.[option.key] ?? 0
          const percent =
            totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0

          return (
            <button
              className={
                selectedVote === option.key
                  ? 'vote-button is-selected'
                  : 'vote-button'
              }
              key={option.key}
              type="button"
              onClick={() => vote(achievementId, option.key)}
            >
              <span>{option.label}</span>
              <strong>{count}표</strong>
              <small>{percent}%</small>
            </button>
          )
        })}
      </div>
      {selectedVote && (
        <div className="vote-change-actions">
          <p className="muted">
            선택한 난이도를 다시 누르지 않고 다른 난이도로 바로 변경할 수
            있습니다.
          </p>
          <button
            className="secondary-button"
            type="button"
            onClick={() => removeVote(achievementId)}
          >
            내 투표 취소
          </button>
        </div>
      )}
    </section>
  )
}
