import { NavLink, Outlet } from 'react-router-dom'

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
      </header>
      <Outlet />
    </div>
  )
}
