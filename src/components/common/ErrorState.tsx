interface ErrorStateProps {
  title?: string
  message?: string
}

export function ErrorState({
  title = '데이터를 불러오지 못했습니다.',
  message = '잠시 후 다시 시도해주세요.',
}: ErrorStateProps) {
  return (
    <section className="empty-state">
      <p className="eyebrow">Error</p>
      <h2>{title}</h2>
      <p className="muted">{message}</p>
    </section>
  )
}
