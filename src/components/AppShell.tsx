import { NavLink, Outlet } from 'react-router-dom'

const icons = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  ),
  practice: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z" />
      <path d="M9 9h6M9 13h4" />
    </svg>
  ),
  shenlun: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 4h10l4 4v12H5V4Z" />
      <path d="M15 4v4h4M8 12h8M8 16h6" />
    </svg>
  ),
  pro: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 4 7v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7l-8-4Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  me: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19.5c1.8-3.2 4.2-4.8 7-4.8s5.2 1.6 7 4.8" />
    </svg>
  ),
}

export function AppShell() {
  return (
    <div className="app-shell">
      <Outlet />
      <nav className="bottom-nav bottom-nav-5" aria-label="主导航">
        <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          {icons.home}
          首页
        </NavLink>
        <NavLink
          to="/practice"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          {icons.practice}
          行测
        </NavLink>
        <NavLink
          to="/shenlun"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          {icons.shenlun}
          申论
        </NavLink>
        <NavLink to="/pro" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          {icons.pro}
          专业
        </NavLink>
        <NavLink to="/me" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          {icons.me}
          我的
        </NavLink>
      </nav>
    </div>
  )
}
