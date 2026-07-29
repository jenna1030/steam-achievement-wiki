interface CompletionBadgeProps {
  label?: string
}

export function CompletionBadge({
  label = '100% 완료',
}: CompletionBadgeProps) {
  return (
    <strong className="perfect-game-badge">
      <img aria-hidden="true" src="/assets/completion-medal.png" />
      <span>{label}</span>
    </strong>
  )
}
