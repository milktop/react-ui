import { createContext, useContext } from 'react'

// A Sidebar's: in an accordion, the one open group (by id).
export type SidebarState = { accordion: boolean, openGroup: string | null, setOpenGroup: (id: string | null) => void }
export const SidebarContext = createContext<SidebarState | null>(null)
export const useSidebar = () => useContext(SidebarContext)

// A NavSection's: its groups report whether they're open (for the "collapse
// all" button's icon) and hand it their setter (to open or close them all).
export type SectionState = {
  register: (id: string, setOpen: (open: boolean) => void) => () => void
  report: (id: string, open: boolean) => void
}
export const SectionContext = createContext<SectionState | null>(null)

// Inside a rail group's flyout, items keep their labels (no rail tooltips).
export const FlyoutContext = createContext(false)
