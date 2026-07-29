import { NavLink, Outlet } from 'react-router-dom'
import styled from 'styled-components'

const TopbarActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  color: #dce6ff;
  font-size: 13px;
  font-weight: 800;
`

const LoginButton = styled.button`
  min-height: 36px;
  padding: 0 12px;
  color: var(--color-navy);
  background: var(--color-paper);
  border-color: var(--color-paper);

  &:hover {
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
          <LoginButton type="button">
            로그인하기
          </LoginButton>
          <span>제작 이지현</span>
        </TopbarActions>
      </header>
      <Outlet />
    </div>
  )
}
