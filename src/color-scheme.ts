// Light, dark or system colour scheme for the whole page:
//
//   import { colorScheme, useColorScheme } from '@milktop/react-ui'
//   colorScheme.value = 'dark'                  // 'light', 'dark' or 'system'
//   const { scheme, dark, setScheme } = useColorScheme()   // re-renders on change
//
// It puts `dark` on <html> (the theme's dark tokens apply under it) and sets
// `color-scheme` there for native controls and scrollbars. 'system' follows
// the OS setting live. The choice is saved in localStorage (`storageKey`)
// and kept in step across tabs.
import { useSyncExternalStore } from 'react'

export type Scheme = 'light' | 'dark' | 'system'
const schemes: Scheme[] = ['light', 'dark', 'system']
const parse = (scheme: unknown): Scheme => (schemes.includes(scheme as Scheme) ? scheme as Scheme : 'system')

class ColorScheme {
  #key = 'ui-color-scheme'
  #value: Scheme = 'system'
  #systemDark = false
  #listeners = new Set<() => void>()

  constructor() {
    if (typeof document === 'undefined') return
    const media = matchMedia('(prefers-color-scheme: dark)')
    this.#systemDark = media.matches
    media.addEventListener('change', (e) => {
      this.#systemDark = e.matches
      this.#apply()
    })
    addEventListener('storage', (e) => {
      if (e.key !== this.#key) return
      this.#value = parse(e.newValue)
      this.#apply()
    })
    this.#value = this.#load()
    this.#apply()
  }

  get storageKey() { return this.#key }
  // Set it before the page reads a value (it reloads the saved choice).
  set storageKey(key: string) {
    this.#key = key
    this.#value = this.#load()
    this.#apply()
  }

  get value(): Scheme { return this.#value }
  set value(scheme: Scheme) {
    scheme = parse(scheme)
    if (scheme === this.#value) return
    this.#value = scheme
    try { localStorage.setItem(this.#key, scheme) } catch { /* private mode */ }
    this.#apply()
  }

  get dark() { return this.#value === 'dark' || (this.#value === 'system' && this.#systemDark) }

  subscribe = (listener: () => void) => {
    this.#listeners.add(listener)
    return () => { this.#listeners.delete(listener) }
  }

  #load() {
    try { return parse(localStorage.getItem(this.#key)) } catch { return 'system' }
  }

  #apply() {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.classList.toggle('dark', this.dark)
    root.style.colorScheme = this.dark ? 'dark' : 'light'
    this.#listeners.forEach((listener) => listener())
  }
}

export const colorScheme = new ColorScheme()

// The scheme and what's showing, re-rendering when either changes.
export function useColorScheme() {
  const scheme = useSyncExternalStore(colorScheme.subscribe, () => colorScheme.value, () => 'system' as Scheme)
  const dark = useSyncExternalStore(colorScheme.subscribe, () => colorScheme.dark, () => false)
  return { scheme, dark, setScheme: (next: Scheme) => { colorScheme.value = next } }
}
