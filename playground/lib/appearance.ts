// The playground's appearance (the theme is the library's colorScheme):
// accent, font, radius, density, backgrounds and the shell's layout, all
// applied by overriding the library's --ui-* tokens on <html>, which is
// exactly what an app would do in its own CSS. The same options as
// svelte-ui's and imba-ui's playgrounds.
import { useSyncExternalStore } from 'react'
import { colorScheme } from '@milktop/react-ui'

// Each accent: light and dark values for [accent, accent text, soft, soft text, ring].
export const accents = {
  blue: { name: 'Blue', light: ['#2563eb', 'white', '#dbeafe', '#1e40af', '#3b82f6'], dark: ['#3b82f6', 'white', '#1e3a8a', '#bfdbfe', '#60a5fa'] },
  indigo: { name: 'Indigo', light: ['#4f46e5', 'white', '#e0e7ff', '#3730a3', '#6366f1'], dark: ['#6366f1', 'white', '#312e81', '#c7d2fe', '#818cf8'] },
  violet: { name: 'Violet', light: ['#7c3aed', 'white', '#ede9fe', '#5b21b6', '#8b5cf6'], dark: ['#8b5cf6', 'white', '#4c1d95', '#ddd6fe', '#a78bfa'] },
  teal: { name: 'Teal', light: ['#0d9488', 'white', '#ccfbf1', '#115e59', '#14b8a6'], dark: ['#14b8a6', '#042f2e', '#134e4a', '#99f6e4', '#2dd4bf'] },
  emerald: { name: 'Emerald', light: ['#059669', 'white', '#d1fae5', '#065f46', '#10b981'], dark: ['#10b981', '#022c22', '#064e3b', '#a7f3d0', '#34d399'] },
  amber: { name: 'Amber', light: ['#d97706', 'white', '#fef3c7', '#92400e', '#f59e0b'], dark: ['#f59e0b', '#451a03', '#451a03', '#fde68a', '#fbbf24'] },
  rose: { name: 'Rose', light: ['#e11d48', 'white', '#ffe4e6', '#9f1239', '#f43f5e'], dark: ['#f43f5e', 'white', '#4c0519', '#fecdd3', '#fb7185'] },
  neutral: { name: 'Neutral', light: ['#18181b', 'white', '#f4f4f5', '#18181b', '#71717a'], dark: ['#fafafa', '#18181b', '#27272a', '#fafafa', '#a1a1aa'] },
}

export const fonts = {
  system: { label: 'System', family: 'system-ui, sans-serif' },
  inter: { label: 'Inter', family: "'Inter Variable', system-ui, sans-serif" },
  jakarta: { label: 'Jakarta', family: "'Plus Jakarta Sans Variable', system-ui, sans-serif" },
  geist: { label: 'Geist', family: "'Geist Variable', system-ui, sans-serif" },
  dm: { label: 'DM Sans', family: "'DM Sans Variable', system-ui, sans-serif" },
}

export const radii = { sharp: ['Sharp', '2px'], default: ['Default', '6px'], round: ['Round', '12px'] }
// Control heights: [label, md, sm, lg].
export const densities = { compact: ['Compact', '2rem', '1.75rem', '2.5rem'], default: ['Default', '2.25rem', '2rem', '2.75rem'], comfortable: ['Roomy', '2.5rem', '2.25rem', '3rem'] }
export const layouts = { full: ['Full'], inset: ['Inset'] }
// Light-mode backgrounds (dark mode keeps its own): [label, canvas, inset sidebar shade].
export const canvases = {
  cool: ['Cool', '#f2f4f7', '#f8f9fb'],
  warm: ['Warm', '#f4f3ef', '#faf9f6'],
  tinted: ['Tinted', 'color-mix(in oklab, var(--ui-accent) 2.5%, #f6f7f9)', 'color-mix(in oklab, var(--ui-accent) 1.2%, #fbfbfc)'],
  white: ['White', '#ffffff', '#ffffff'],
}
export const sidebars = { shaded: ['Shaded'], white: ['White'] }
export const widths = { default: ['Default'], wide: ['Wide'], full: ['Full'] }
export const aligns = { center: ['Centred'], start: ['Left'] }

// Options for a Segmented or Select: [{ value, label }].
export const options = (map: Record<string, string[] | { label: string }>) =>
  Object.entries(map).map(([value, option]) => ({ value, label: Array.isArray(option) ? option[0] : option.label }))

export const defaults = {
  accent: 'blue' as keyof typeof accents, font: 'jakarta' as keyof typeof fonts, radius: 'default' as keyof typeof radii,
  density: 'default' as keyof typeof densities, layout: 'inset' as keyof typeof layouts, canvas: 'cool' as keyof typeof canvases,
  sidebar: 'shaded' as keyof typeof sidebars, width: 'default' as keyof typeof widths, align: 'center' as keyof typeof aligns,
}
export type Appearance = typeof defaults

const KEY = 'react-ui:appearance'
function load(): Appearance {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') } } catch { return { ...defaults } }
}

let state = load()
const listeners = new Set<() => void>()

// Applies it to <html> and saves it.
function apply() {
  const root = document.documentElement
  const dark = colorScheme.dark
  const [accent, accentText, soft, softText, ring] = (accents[state.accent] ?? accents.blue)[dark ? 'dark' : 'light']
  const [, md, sm, lg] = densities[state.density] ?? densities.default
  const tokens = {
    '--ui-accent': accent, '--ui-accent-text': accentText, '--ui-accent-soft': soft, '--ui-accent-soft-text': softText,
    '--ui-ring': ring, '--ui-ring-soft': `${ring}33`,
    '--ui-radius': (radii[state.radius] ?? radii.default)[1],
    '--ui-control-height': md, '--ui-control-height-sm': sm, '--ui-control-height-lg': lg,
    '--ui-font': (fonts[state.font] ?? fonts.jakarta).family,
  }
  for (const [name, value] of Object.entries(tokens)) root.style.setProperty(name, value)

  // Backgrounds: light mode only, so dark mode's own values apply there.
  const [, canvas, shade] = canvases[state.canvas] ?? canvases.cool
  if (dark) {
    root.style.removeProperty('--ui-canvas')
    root.style.removeProperty('--ui-sidebar-bg')
  } else {
    root.style.setProperty('--ui-canvas', canvas)
    root.style.setProperty('--ui-sidebar-bg', state.sidebar === 'white' ? '#ffffff' : shade)
  }
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* private mode */ }
}

apply()
// Accents and backgrounds differ in dark mode.
colorScheme.subscribe(apply)

export function setAppearance(change: Partial<Appearance>) {
  state = { ...state, ...change }
  apply()
  listeners.forEach((listener) => listener())
}

export function resetAppearance() {
  colorScheme.value = 'system'
  setAppearance(defaults)
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
export const useAppearance = () => useSyncExternalStore(subscribe, () => state)
