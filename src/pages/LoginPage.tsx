import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const loginWithSteamId = useAuthStore((state) => state.loginWithSteamId)
  const error = searchParams.get('error')

  useEffect(() => {
    const steamId = searchParams.get('steamid')

    if (!steamId) {
      return
    }

    loginWithSteamId(steamId)
    navigate('/mypage', { replace: true })
  }, [loginWithSteamId, navigate, searchParams])

  return (
    <main className="page auth-page">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Sign in with Steam</p>
          <h1>Steam으로 로그인하기</h1>
          <p className="muted">
            Steam 계정으로 로그인하면 공개 상태인 내 라이브러리를 불러와
            도전과제 확인 흐름과 연결할 수 있습니다.
          </p>
        </div>

        {error && (
          <p className="auth-message">
            Steam 로그인을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.
          </p>
        )}

        {user ? (
          <div className="auth-actions">
            <p className="muted">현재 SteamID `{user.steamId}`로 로그인되어 있습니다.</p>
            <Link className="button-link" to="/mypage">
              마이페이지로 이동
            </Link>
          </div>
        ) : (
          <div className="auth-actions">
            <a className="steam-login-button" href="/api/auth/steam">
              Steam으로 계속하기
            </a>
            <p className="muted">
              이 앱은 Steam 비밀번호를 직접 입력받지 않고 Steam 공식 OpenID
              화면으로 이동합니다.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
