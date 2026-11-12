import { createContext } from 'react'

// True inside a Dialog or Sheet (z-index 100). A Popover there opens on top of it: its portal lands
// before the dialog's in the page (children mount first), so an equal z-index would leave it behind.
export const InLayer = createContext(false)
