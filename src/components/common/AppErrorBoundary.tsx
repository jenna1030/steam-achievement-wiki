import { Component, type ErrorInfo, type ReactNode } from 'react'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled application error', error, errorInfo)
  }

  private recover = () => {
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="page fatal-error-page">
          <section className="empty-state">
            <p className="eyebrow">Recovery</p>
            <h1>페이지를 표시하는 중 문제가 발생했습니다.</h1>
            <p className="muted">
              저장된 개인 데이터는 유지됩니다. 홈으로 돌아가 다시 시도해
              주세요.
            </p>
            <button type="button" onClick={this.recover}>
              홈에서 다시 시작
            </button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
