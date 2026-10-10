import { createContext, useContext } from 'react'

// What an AppShell tells the parts inside it (Sidebar, Topbar, NavItem…):
// whether the sidebar is a rail or a phone drawer, and how to toggle it.
export type Shell = {
  rail: boolean
  mobile: boolean
  drawerOpen: boolean
  toggle: () => void
  close: () => void
}

export const ShellContext = createContext<Shell | null>(null)
export const useShell = () => useContext(ShellContext)
