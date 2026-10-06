import type { SupportedStorage } from '@supabase/supabase-js'

export const previewAuthStorage: SupportedStorage = {
  getItem: (key: string) => {
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string) => {
    try {
      sessionStorage.setItem(key, value)
    } catch {}
  },
  removeItem: (key: string) => {
    try {
      sessionStorage.removeItem(key)
    } catch {}
  },
}
