const memoryStore = new Map()

function getStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
  } catch (err) {
    console.warn('localStorage unavailable, fallback to memory:', err)
  }

  return {
    getItem(key) {
      return memoryStore.has(key) ? memoryStore.get(key) : null
    },
    setItem(key, value) {
      memoryStore.set(key, String(value))
    },
    removeItem(key) {
      memoryStore.delete(key)
    },
    clear() {
      memoryStore.clear()
    },
  }
}

export function storageGet(key) {
  try {
    return getStorage().getItem(key)
  } catch (err) {
    console.warn('storageGet failed:', err)
    return null
  }
}

export function storageSet(key, value) {
  try {
    getStorage().setItem(key, value)
  } catch (err) {
    console.warn('storageSet failed:', err)
  }
}

export function storageRemove(key) {
  try {
    getStorage().removeItem(key)
  } catch (err) {
    console.warn('storageRemove failed:', err)
  }
}