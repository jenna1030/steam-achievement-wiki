import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const navItems = [
  { to: '/', label: '홈' },
  { to: '/games', label: '게임 검색' },
  { to: '/guides/new', label: '공략 작성' },
  { to: '/checklist', label: '체크리스트' },
]

export function AppLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        본문 바로가기
      </a>
      <header className="topbar">
        <NavLink className="brand" to="/">
          Achievement Wiki
        </NavLink>
        <nav className="nav" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <NavLink
              className={({ isActive }) =>
                isActive ? 'nav-link is-active' : 'nav-link'
              }
              key={item.to}
              to={item.to}
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-actions">
          <NavLink
            className={({ isActive }) =>
              isActive ? 'login-link is-active' : 'login-link'
            }
            to={user ? '/mypage' : '/login'}
          >
            {user ? '마이페이지' : '로그인하기'}
          </NavLink>
          {user && (
            <button
              className="header-logout-button"
              type="button"
              onClick={() => {
                void logout().then(() => navigate('/login'))
              }}
            >
              로그아웃
            </button>
          )}
        </div>
      </header>
      <div id="main-content" tabIndex={-1}>
        <Outlet />
      </div>
    </div>
  )
}
