/**
 * An app layout: the sidebar down the left, the top bar and page beside it.
 * Put a Sidebar, a Topbar and a Page inside; each takes its place.
 *
 *   <AppShell inset persist="app:sidebar">
 *     <Sidebar logo="TutorApp">…</Sidebar>
 *     <Topbar end={<Button icon="lucide:bell" aria-label="Notifications" />}>…</Topbar>
 *     <Page heading="Students">…</Page>
 *   </AppShell>
 *
 * - `inset`: the page as a rounded panel on a frame, with a grey sidebar
 *   whose hovered and current items go white (the `--ui-sidebar-inset-*` tokens)
 * - `scroll`: what scrolls on wide screens: 'window' (default) or 'page',
 *   where the shell fills the viewport and only the page scrolls. `inset`
 *   always scrolls the page there. Phones scroll the window either way, so
 *   the browser can hide its toolbars. The page then takes focus, so Space
 *   and the arrow keys scroll it straight away, prints in full, and is marked
 *   `scroll-region` for Inertia's scroll resets. Listen for scrolling on the
 *   page (`useShell().scroller()` in the shell's parts), not the window.
 * - `collapsed`, `defaultCollapsed`; `onCollapsedChange`: the sidebar as an
 *   icon rail
 * - `persist`: a localStorage key to remember `collapsed`
 * - `breakpoint`: below this width (768px) the sidebar is a drawer, opened
 *   from the top bar's menu button
 * - `shortcut`: false to leave ⌘B alone (for a second shell on the page)
 *
 * ⌘B (Ctrl+B) collapses the sidebar, or opens the drawer on phones; Escape
 * closes the drawer. Parts inside read the shell with `useShell()`.
 */
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type HTMLAttributes } from 'react'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import { ShellContext, type Shell } from './shell.js'
import '../theme.css'
import './app-shell.css'

export type AppShellProps = HTMLAttributes<HTMLDivElement> & {
  inset?: boolean
  scroll?: 'window' | 'page'
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  persist?: string | null
  breakpoint?: number
  shortcut?: boolean
  classes?: Classes<'root' | 'backdrop'>
}

function saved(key: string | null) {
  try {
    const value = key ? localStorage.getItem(key) : null
    return value === null ? null : value === 'true'
  } catch {
    return null
  }
}

// Whether the window is narrower than the breakpoint, kept current.
function useNarrow(breakpoint: number) {
  const query = `(max-width: ${breakpoint - 1}px)`
  const subscribe = useCallback((change: () => void) => {
    const list = matchMedia(query)
    list.addEventListener('change', change)
    return () => list.removeEventListener('change', change)
  }, [query])
  return useSyncExternalStore(subscribe, () => matchMedia(query).matches, () => false)
}

// The keys that scroll the window do nothing for the page while nothing is
// focused, and Chrome ignores them on the page itself (focusable, see Page):
// they scroll it here, and focus it. Focus inside the page leaves them to
// the browser (fields, nested scrollers).
function scrollKey(e: KeyboardEvent, page: HTMLElement) {
  if (![null, document.body, document.documentElement, page].includes(document.activeElement as HTMLElement | null)) return
  if (e.altKey || e.ctrlKey || e.metaKey) return
  const step = page.clientHeight * 0.875
  const top = ({
    ArrowDown: 40, ArrowUp: -40, PageDown: step, PageUp: -step,
    ' ': e.shiftKey ? -step : step,
    Home: -page.scrollTop, End: page.scrollHeight,
  } as Record<string, number>)[e.key]
  if (top === undefined) return
  e.preventDefault()
  page.focus({ preventScroll: true })
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches
  page.scrollBy({ top, behavior: still ? 'auto' : 'smooth' })
}

export function AppShell({
  inset = false, scroll = 'window', collapsed: collapsedProp, defaultCollapsed = false, onCollapsedChange, persist = null, breakpoint = 768,
  shortcut = true, className, classes, children, ...rest
}: AppShellProps) {
  const part = partsOf('app-shell', classes)
  const [initial] = useState(() => saved(persist) ?? defaultCollapsed)
  const [collapsed, setCollapsed] = useControllable(collapsedProp, initial, onCollapsedChange)
  const mobile = useNarrow(breakpoint)
  const [drawer, setDrawer] = useState(false)
  // Widening the window past the breakpoint closes the drawer.
  const drawerOpen = drawer && mobile
  const rail = collapsed && !mobile
  // Only the page scrolls (see `scroll`).
  const pageScroll = !mobile && (inset || scroll === 'page')
  const root = useRef<HTMLDivElement>(null)
  const page = useCallback(() => root.current?.querySelector<HTMLElement>(':scope > [data-scope=page]') ?? null, [])

  const toggle = useCallback(() => {
    if (mobile) return setDrawer(!drawerOpen)
    setCollapsed(!collapsed)
    try { if (persist) localStorage.setItem(persist, String(!collapsed)) } catch { /* private mode */ }
  }, [mobile, drawerOpen, collapsed, setCollapsed, persist])

  const shell = useMemo<Shell>(() => ({
    rail, mobile, drawerOpen, pageScroll, toggle, close: () => setDrawer(false),
    scroller: () => (pageScroll && page()) || document.scrollingElement as HTMLElement,
  }), [rail, mobile, drawerOpen, pageScroll, toggle, page])

  // Where the main area starts, for things fixed to the viewport that centre
  // over it (ActionBar).
  useEffect(() => {
    if (!shortcut) return
    const left = mobile ? '0px' : rail ? 'var(--ui-sidebar-rail-width)' : 'var(--ui-sidebar-width)'
    document.documentElement.style.setProperty('--ui-main-left', left)
    return () => { document.documentElement.style.removeProperty('--ui-main-left') }
  }, [shortcut, mobile, rail])

  useEffect(() => {
    function keydown(e: KeyboardEvent) {
      // Not in rich text editors, where it means bold.
      if (shortcut && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b' && !(e.target as HTMLElement | null)?.isContentEditable) {
        e.preventDefault()
        toggle()
      } else if (e.key === 'Escape' && drawerOpen) setDrawer(false)
      else if (pageScroll && !e.defaultPrevented) {
        const el = page()
        if (el) scrollKey(e, el)
      }
    }
    addEventListener('keydown', keydown)
    return () => removeEventListener('keydown', keydown)
  }, [shortcut, toggle, drawerOpen, pageScroll, page])

  return (
    <ShellContext value={shell}>
      <div ref={root} {...rest} {...part('root')} className={cx(className, classes?.root)} data-inset={inset || undefined}
        data-page-scroll={pageScroll || undefined}
        data-rail={rail || undefined} data-mobile={mobile || undefined}>
        {children}
        {drawerOpen && <div {...part('backdrop')} role="presentation" onClick={() => setDrawer(false)} />}
      </div>
    </ShellContext>
  )
}

export { useShell } from './shell.js'
