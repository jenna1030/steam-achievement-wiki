import {
  Component,
  createRef,
  type ErrorInfo,
  type ReactNode,
} from 'react'

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
  private headingRef = createRef<HTMLHeadingElement>()

  state: AppErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled application error', error, errorInfo)
  }

  componentDidUpdate(
    _previousProps: AppErrorBoundaryProps,
    previousState: AppErrorBoundaryState,
  ) {
    if (!previousState.hasError && this.state.hasError) {
      this.headingRef.current?.focus()
    }
  }

  private reload = () => {
    window.location.reload()
  }

  private goHome = () => {
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="page fatal-error-page">
          <section
            aria-labelledby="fatal-error-title"
            className="empty-state"
            role="alert"
          >
            <p className="eyebrow">Recovery</p>
            <h1
              id="fatal-error-title"
              ref={this.headingRef}
              tabIndex={-1}
            >
              페이지를 표시하는 중 문제가 발생했습니다.
            </h1>
            <p className="muted">
              저장된 개인 데이터는 유지됩니다. 홈으로 돌아가 다시 시도해
              주세요.
            </p>
            <div className="fatal-error-actions">
              <button type="button" onClick={this.reload}>
                다시 불러오기
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={this.goHome}
              >
                홈으로 이동
              </button>
            </div>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}
