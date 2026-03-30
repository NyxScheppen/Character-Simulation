import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { storageGet, storageSet } from '../utils/storage'

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
  gold: {
    key: 'gold',
    label: '金黄',
    className: 'theme-gold',
  },
  navy: {
    key: 'navy',
    label: '深蓝',
    className: 'theme-navy',
  },
  brown: {
    key: 'brown',
    label: '深棕',
    className: 'theme-brown',
  },
  tealblue: {
    key: 'tealblue',
    label: '蓝绿',
    className: 'theme-tealblue',
  },
  slate: {
    key: 'slate',
    label: '灰蓝',
    className: 'theme-slate',
  },
}

const STORAGE_KEY = 'story-pet-theme'

function safeGetLocalStorage(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.storageGet(key)
    }
  } catch (err) {
    console.warn('storageGet failed:', err)
  }
  return null
}

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => {
    return safeGetLocalStorage(STORAGE_KEY) || 'moss'
  })

  useEffect(() => {
    storageSet(STORAGE_KEY, themeKey)
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