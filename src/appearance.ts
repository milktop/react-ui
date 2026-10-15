// The app's accent colour and sidebar style, chosen by its users (with
// <Appearance>) or set in code, saved like colorScheme:
//
//   import { appearance, useAppearance } from '@milktop/react-ui'
//   appearance.defaults = { accent: 'teal', sidebar: 'neutral' }
//   appearance.update({ accent: 'violet', sidebar: 'dark' })
//   appearance.load(user.appearance)        // a saved choice, e.g. from the server
//   appearance.onChange = (value) => save(value)
//   const { accent, custom, sidebar } = useAppearance()   // re-renders on change
//
// - `accent`: a name from `accents` (Tailwind's scales, each 600 taking white
//   text), or `custom`: any hex colour, its scale worked out in the browser
//   (CSS relative colours keep its hue), e.g. to try a brand colour
// - `sidebar`: a name from `sidebarStyles`, light mode only (dark keeps its
//   own layers). 'default' leaves the theme's sidebar as it is.
// - `defaults`: what a visitor with nothing saved gets, and what `reset`
//   goes back to
// - `update(changes)` sets and saves them and calls `onChange` with `value`
//   ({ accent, custom, sidebar }); `load(value)` applies a saved one without
//   calling it
// - `restrict(accents, sidebars)` moves a choice outside those lists to their
//   first item (<Appearance> does this with its own lists); a custom colour
//   stays only when it's the default
//
// The accent becomes the --ui-accent-50 … -950 scale on <html>, which the
// accent tokens are steps of (see theme.css); the sidebar style is
// `data-ui-sidebar-style` there (its styles are in sidebar.css). Saved in
// localStorage (`storageKey`), scale included, so a script in the page's
// <head> can paint it before the bundle loads (see the README).
import { useSyncExternalStore } from 'react'

export const accentSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

// [the scale, the text on its 500 (dark mode's accent)]
export const accents = {
  slate: [['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a', '#020617'], 'white'],
  blue: [['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'], 'white'],
  indigo: [['#eef2ff', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81', '#1e1b4b'], 'white'],
  violet: [['#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#2e1065'], 'white'],
  teal: [['#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a', '#042f2e'], '#042f2e'],
  emerald: [['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#022c22'], '#022c22'],
  rose: [['#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337', '#4c0519'], 'white'],
} satisfies Record<string, [string[], string]>

export type AccentName = keyof typeof accents

export const sidebarStyles = ['default', 'neutral', 'soft', 'tint', 'accent', 'dark', 'deep'] as const
export type SidebarStyle = typeof sidebarStyles[number]

export type AppearanceValue = { accent: AccentName, custom: string | null, sidebar: SidebarStyle }

// Old names still accepted, e.g. from a saved choice
const sidebarAliases: Record<string, SidebarStyle> = { 'neutral-accent': 'neutral' }

// Lightness and share of the colour's chroma per step, for a custom colour.
const ramp = [[0.98, 0.15], [0.95, 0.3], [0.9, 0.5], [0.83, 0.7], [0.74, 0.9], [0.65, 1], [0.56, 1], [0.48, 0.9], [0.4, 0.75], [0.33, 0.6], [0.23, 0.45]]

// A custom colour's scale, as CSS relative colours.
export const accentScale = (hex: string) => ramp.map(([l, c]) => `oklch(from ${hex} ${l} calc(c * ${c}) h)`)

const isHex = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)

// Only known accents and sidebar styles, and hex colours.
function pick(value: unknown): Partial<AppearanceValue> {
  const out: Partial<AppearanceValue> = {}
  if (!value || typeof value !== 'object') return out
  const { accent, custom, sidebar } = value as Record<string, unknown>
  if (typeof accent === 'string' && accent in accents) out.accent = accent as AccentName
  if (custom === null || isHex(custom)) out.custom = custom
  const style = typeof sidebar === 'string' ? sidebarAliases[sidebar] ?? sidebar : null
  if (sidebarStyles.includes(style as SidebarStyle)) out.sidebar = style as SidebarStyle
  return out
}

class Appearance {
  #key = 'ui-appearance'
  #defaults: AppearanceValue = { accent: 'blue', custom: null, sidebar: 'default' }
  #value: AppearanceValue = { ...this.#defaults }
  #listeners = new Set<() => void>()
  onChange: ((value: AppearanceValue) => void) | null = null

  constructor() {
    if (typeof document === 'undefined') return
    addEventListener('storage', (e) => { if (e.key === this.#key) this.#reload() })
    this.#reload()
  }

  get storageKey() { return this.#key }
  // Set it before the page reads a value (it reloads the saved choice).
  set storageKey(key: string) {
    this.#key = key
    this.#reload()
  }

  get defaults(): AppearanceValue { return this.#defaults }
  set defaults(value: Partial<AppearanceValue>) {
    this.#defaults = { ...this.#defaults, custom: null, ...pick(value) }
    this.#reload()
  }

  // { accent, custom, sidebar }: a new object on every change.
  get value(): AppearanceValue { return this.#value }
  get accent() { return this.#value.accent }
  get custom() { return this.#value.custom }
  get sidebar() { return this.#value.sidebar }

  // The scale showing: [50 … 950] colours, and the text on the 500.
  get scale(): string[] { return this.custom ? accentScale(this.custom) : accents[this.accent][0] }
  get scaleText(): string { return this.custom ? 'white' : accents[this.accent][1] }

  update(changes: Partial<AppearanceValue>) {
    this.#set(changes)
    this.onChange?.(this.#value)
  }

  load(value: unknown) {
    this.#set(value)
  }

  reset() { this.update(this.#defaults) }

  restrict(allowedAccents?: readonly string[] | null, allowedSidebars?: readonly string[] | null) {
    const fix: Partial<AppearanceValue> = {}
    // A custom colour stays only if it's the app's own default
    const customOk = this.custom && this.custom === this.#defaults.custom
    if (allowedAccents?.length && !customOk && (this.custom || !allowedAccents.includes(this.accent))) {
      fix.accent = allowedAccents[0] as AccentName
      fix.custom = null
    }
    if (allowedSidebars?.length && !allowedSidebars.includes(this.sidebar)) fix.sidebar = allowedSidebars[0] as SidebarStyle
    if (Object.keys(fix).length) this.load(fix)
  }

  subscribe = (listener: () => void) => {
    this.#listeners.add(listener)
    return () => { this.#listeners.delete(listener) }
  }

  #reload() {
    let saved: unknown = {}
    try { saved = JSON.parse(localStorage.getItem(this.#key) ?? '{}') } catch { /* private mode, or not JSON */ }
    this.#value = { ...this.#defaults, ...pick(saved) }
    this.#apply()
  }

  #set(changes: unknown) {
    this.#value = { ...this.#value, ...pick(changes) }
    this.#apply()
    try {
      localStorage.setItem(this.#key, JSON.stringify({ scale: this.scale, scaleText: this.scaleText, ...this.#value }))
    } catch { /* private mode */ }
  }

  #apply() {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    this.scale.forEach((color, i) => root.style.setProperty(`--ui-accent-${accentSteps[i]}`, color))
    root.style.setProperty('--ui-accent-500-text', this.scaleText)
    if (this.sidebar === 'default') delete root.dataset.uiSidebarStyle
    else root.dataset.uiSidebarStyle = this.sidebar
    this.#listeners.forEach((listener) => listener())
  }
}

export const appearance = new Appearance()

const serverValue: AppearanceValue = { accent: 'blue', custom: null, sidebar: 'default' }

// The current choice, re-rendering when it changes.
export function useAppearance(): AppearanceValue {
  return useSyncExternalStore(appearance.subscribe, () => appearance.value, () => serverValue)
}
