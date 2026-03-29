import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

const THEMES = {
  wine: {
    key: 'wine',
    label: '深红',
    className: 'theme-wine',
  },
  moss: {
    key: 'moss',
    label: '墨绿',
    className: 'theme-moss',
  },
  violet: {
    key: 'violet',
    label: '紫',
    className: 'theme-violet',
  },
  lake: {
    key: 'lake',
    label: '湖蓝',
    className: 'theme-lake',
  },
  silver: {
    key: 'silver',
    label: '银色',
    className: 'theme-silver',
  },
}

const STORAGE_KEY = 'story-pet-theme'

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || 'moss'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, themeKey)
    const body = document.body
    Object.values(THEMES).forEach((theme) => body.classList.remove(theme.className))
    body.classList.add(THEMES[themeKey].className)
  }, [themeKey])

  const value = useMemo(() => {
    return {
      themeKey,
      setThemeKey,
      themes: Object.values(THEMES),
      currentTheme: THEMES[themeKey],
    }
  }, [themeKey])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme 必须在 ThemeProvider 中使用')
  }
  return context
}