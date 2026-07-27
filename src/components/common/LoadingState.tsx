interface LoadingStateProps {
  message?: string
}

export function LoadingState({
  message = '데이터를 불러오는 중입니다.',
}: LoadingStateProps) {
  return (
    <section className="empty-state">
      <div className="loading-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="muted">{message}</p>
    </section>
  )
}
