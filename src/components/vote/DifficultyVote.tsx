import { useVoteStore } from '../../stores/voteStore'

const voteOptions = [
  { key: 'easy', label: '쉬움' },
  { key: 'normal', label: '보통' },
  { key: 'hard', label: '어려움' },
  { key: 'veryHard', label: '매우 어려움' },
] as const

interface DifficultyVoteProps {
  achievementId: number
}

export function DifficultyVote({ achievementId }: DifficultyVoteProps) {
  const votes = useVoteStore((state) => state.votes)
  const userVotes = useVoteStore((state) => state.userVotes)
  const vote = useVoteStore((state) => state.vote)
  const currentVote = votes.find((item) => item.achievementId === achievementId)
  const totalVotes = currentVote
    ? currentVote.easy + currentVote.normal + currentVote.hard + currentVote.veryHard
    : 0

  return (
    <section className="vote-panel">
      <div>
        <p className="eyebrow">Difficulty Vote</p>
        <h2>체감 난이도 투표</h2>
        <p className="muted">공식 달성률과 별개로 직접 느낀 난이도를 남깁니다.</p>
      </div>
      <div className="vote-options">
        {voteOptions.map((option) => {
          const count = currentVote?.[option.key] ?? 0
          const percent =
            totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0

          return (
            <button
              className={
                userVotes[achievementId] === option.key
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
    </section>
  )
}
