import { createContext, useRef } from 'react'

// True inside a Dialog or Sheet (z-index 100). A Popover there opens on top of it: its portal lands
// before the dialog's in the page (children mount first), so an equal z-index would leave it behind.
export const InLayer = createContext(false)

const multiLine = 'textarea, [contenteditable]:not([contenteditable="false"])'

// Escape from a textarea or the Editor inside the layer leaves the field (what's written stays) and
// keeps the layer open; the next Escape closes it. Single-line fields close it at once.
// Zag calls this even for an Escape something earlier prevented: that one is left alone.
export function useStepBack() {
  const layer = useRef<HTMLDivElement>(null)
  const onEscapeKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return
    const field = event.target.closest<HTMLElement>(multiLine)
    if (!field || !layer.current?.contains(field)) return
    event.preventDefault()
    field.blur()
  }
  return { layer, onEscapeKeyDown }
}
