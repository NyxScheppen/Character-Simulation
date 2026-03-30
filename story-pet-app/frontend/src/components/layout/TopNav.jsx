import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

const navItems = [
  { to: '/chat', label: '对话' },
  { to: '/worldlines', label: '世界线' },
  { to: '/characters', label: '角色' },
  { to: '/relationship-graph', label: '关系图' },
]

export default function TopNav() {
  const [open, setOpen] = useState(false)
  const { themeKey, setThemeKey, themes } = useTheme()

  return (
    <header className="top-nav">
      <div className="top-nav__brand">
        <h1>Character Simulation·Branching Fate</h1>
      </div>

      <div className="top-nav__right">
        <nav className="top-nav__menu">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `top-nav__link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="theme-dropdown">
          <button
            type="button"
            className="theme-switch-btn"
            onClick={() => setOpen((v) => !v)}
          >
            主题切换
          </button>

          {open ? (
            <div className="theme-dropdown__menu">
              {themes.map((theme) => (
                <button
                  key={theme.key}
                  type="button"
                  className={`theme-dropdown__item ${themeKey === theme.key ? 'active' : ''}`}
                  onClick={() => {
                    setThemeKey(theme.key)
                    setOpen(false)
                  }}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}