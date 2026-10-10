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
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type HTMLAttributes } from 'react'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import { ShellContext, type Shell } from './shell.js'
import '../theme.css'
import './app-shell.css'

export type AppShellProps = HTMLAttributes<HTMLDivElement> & {
  inset?: boolean
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

export function AppShell({
  inset = false, collapsed: collapsedProp, defaultCollapsed = false, onCollapsedChange, persist = null, breakpoint = 768,
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

  const toggle = useCallback(() => {
    if (mobile) return setDrawer(!drawerOpen)
    setCollapsed(!collapsed)
    try { if (persist) localStorage.setItem(persist, String(!collapsed)) } catch { /* private mode */ }
  }, [mobile, drawerOpen, collapsed, setCollapsed, persist])

  const shell = useMemo<Shell>(() => ({ rail, mobile, drawerOpen, toggle, close: () => setDrawer(false) }), [rail, mobile, drawerOpen, toggle])

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
    }
    addEventListener('keydown', keydown)
    return () => removeEventListener('keydown', keydown)
  }, [shortcut, toggle, drawerOpen])

  return (
    <ShellContext value={shell}>
      <div {...rest} {...part('root')} className={cx(className, classes?.root)} data-inset={inset || undefined}
        data-rail={rail || undefined} data-mobile={mobile || undefined}>
        {children}
        {drawerOpen && <div {...part('backdrop')} role="presentation" onClick={() => setDrawer(false)} />}
      </div>
    </ShellContext>
  )
}

export { useShell } from './shell.js'
