import { createContext, useContext } from 'react'

// What an AppShell tells the parts inside it (Sidebar, Topbar, NavItem…):
// whether the sidebar is a rail or a phone drawer, how to toggle it, and
// what scrolls.
export type Shell = {
  rail: boolean
  mobile: boolean
  drawerOpen: boolean
  // Only the page scrolls, not the window; `scroller` is what scrolls.
  pageScroll: boolean
  scroller: () => HTMLElement
  toggle: () => void
  close: () => void
}

export const ShellContext = createContext<Shell | null>(null)
export const useShell = () => useContext(ShellContext)
