import { NavLink, Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { useAuthStore } from '../../stores/authStore'

const TopbarActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  color: #dce6ff;
  font-size: 13px;
  font-weight: 800;
`

const LoginLink = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 12px;
  color: var(--color-navy);
  font-weight: 900;
  text-decoration: none;
  background: var(--color-paper);
  border: 1px solid var(--color-paper);
  border-radius: 6px;

  &:hover,
  &.is-active {
    color: var(--color-panel);
    background: var(--color-red);
    border-color: var(--color-red);
  }
`

const navItems = [
  { to: '/', label: '홈' },
  { to: '/games', label: '게임 검색' },
  { to: '/guides/new', label: '공략 작성' },
  { to: '/checklist', label: '체크리스트' },
]

export function AppLayout() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="app-shell">
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
        <TopbarActions>
          <LoginLink
            className={({ isActive }) =>
              isActive ? 'login-link is-active' : 'login-link'
            }
            to={user ? '/mypage' : '/login'}
          >
            {user ? '마이페이지' : '로그인하기'}
          </LoginLink>
        </TopbarActions>
      </header>
      <Outlet />
    </div>
  )
}
