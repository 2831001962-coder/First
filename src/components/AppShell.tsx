import { NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/', label: '首页', end: true },
  { to: '/produce', label: '生产' },
  { to: '/lines', label: '产线' },
  { to: '/ledger', label: '台账' },
]

export function AppShell() {
  return (
    <div className="app-shell">
      <Outlet />
      <nav className="tab-nav" aria-label="主导航">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `tab-item${isActive ? ' active' : ''}`}
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
