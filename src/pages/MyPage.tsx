import { Link, useNavigate } from 'react-router-dom'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { useSteamLibraryQuery } from '../hooks/useSteamLibraryQuery'
import { useAuthStore } from '../stores/authStore'

function formatPlaytime(minutes: number) {
  if (minutes < 60) {
    return `${minutes}분`
  }

  return `${Math.round(minutes / 60)}시간`
}

export function MyPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const {
    data: library,
    isError,
    isLoading,
  } = useSteamLibraryQuery(user?.steamId)

  if (!user) {
    return (
      <main className="page">
        <section className="empty-state">
          <h1>로그인이 필요합니다.</h1>
          <p className="muted">
            Steam 계정으로 로그인하면 공개 라이브러리를 확인할 수 있습니다.
          </p>
          <Link className="button-link" to="/login">
            로그인하러 가기
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="profile-panel">
        <div>
          <p className="eyebrow">My Steam Library</p>
          <h1>마이페이지</h1>
          <p className="muted">SteamID: {user.steamId}</p>
        </div>
        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          로그아웃
        </button>
      </section>

      {isLoading && <LoadingState message="Steam 라이브러리를 불러오는 중입니다." />}
      {isError && (
        <ErrorState
          message="Steam 프로필의 게임 세부 정보가 비공개이면 라이브러리를 가져오지 못할 수 있습니다."
          title="라이브러리를 불러오지 못했습니다."
        />
      )}
      {library && (
        <>
          <section className="info-grid">
            <article>
              <strong>{library.gameCount}</strong>
              <span>공개 라이브러리 게임</span>
            </article>
            <article>
              <strong>{library.games.slice(0, 12).length}</strong>
              <span>화면 표시 항목</span>
            </article>
            <article>
              <strong>
                {formatPlaytime(
                  library.games.reduce(
                    (total, game) => total + game.playtime_forever,
                    0,
                  ),
                )}
              </strong>
              <span>전체 플레이 시간</span>
            </article>
          </section>

          {library.games.length > 0 ? (
            <section className="steam-game-grid">
              {library.games.slice(0, 12).map((game) => (
                <article className="steam-game-card" key={game.appid}>
                  <Link to={`/games/${game.appid}`}>
                    <img
                      src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                      alt={`${game.name} 대표 이미지`}
                    />
                    <div>
                      <p>플레이 시간 {formatPlaytime(game.playtime_forever)}</p>
                      <h3>{game.name}</h3>
                    </div>
                  </Link>
                </article>
              ))}
            </section>
          ) : (
            <section className="empty-state">
              <h2>표시할 라이브러리가 없습니다.</h2>
              <p className="muted">
                Steam 프로필 공개 범위에서 게임 세부 정보 공개 여부를 확인해
                주세요.
              </p>
            </section>
          )}
        </>
      )}
    </main>
  )
}
