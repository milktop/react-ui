/**
 * Nav items under a label that opens and closes.
 *
 *   <Sidebar.Group label="Forms" icon="lucide:form" defaultOpen>
 *     <Sidebar.Item href="/input">Input</Sidebar.Item>
 *   </Sidebar.Group>
 *
 * - `label`: its text; `icon`: an Iconify name
 * - `open`, `defaultOpen`; `onOpenChange`: called with the new open state.
 *   In an `accordion` Sidebar, opening one closes the others.
 *
 * In the rail only its icon shows, and its items open beside it as a flyout:
 * on hover, or on click for keyboard and touch. Escape, leaving it or
 * following a link closes it. It moves up when it would run past the bottom
 * of the window, and scrolls when taller than it.
 */
import { useContext, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type FocusEvent, type HTMLAttributes, type KeyboardEvent, type MouseEvent } from 'react'
import '../icons.js'
import { useShell } from '../app-shell/shell.js'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import { FlyoutContext, SectionContext, useSidebar } from './context.js'
import '../theme.css'
import './sidebar.css'

export type NavGroupProps = HTMLAttributes<HTMLDivElement> & {
  label: string
  icon?: string | null
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  classes?: Classes<'root' | 'trigger' | 'icon' | 'text' | 'indicator' | 'children' | 'panel' | 'flyoutHeading'>
}

export function NavGroup({
  label, icon = null, open: openProp, defaultOpen = false, onOpenChange, className, classes, children, ...rest
}: NavGroupProps) {
  const shell = useShell()
  const sidebar = useSidebar()
  const section = useContext(SectionContext)
  const part = partsOf('nav-group', classes)
  const id = useId()
  const rail = !!shell?.rail
  const [own, setOwn] = useControllable(openProp, defaultOpen, onOpenChange)
  // In an accordion, open only while it's the one open group (or none has
  // been picked yet, as at the start).
  const open = own && !(sidebar?.accordion && sidebar.openGroup !== null && sidebar.openGroup !== id)

  const setOpen = (next: boolean) => {
    setOwn(next)
    if (next && sidebar?.accordion) sidebar.setOpenGroup(id)
  }
  // The latest setter, for the section's "collapse all".
  const latest = useRef(setOpen)
  useEffect(() => { latest.current = setOpen })
  useEffect(() => section?.register(id, (next) => latest.current(next)), [section, id])
  useEffect(() => section?.report(id, open), [section, id, open])

  const [flyout, setFlyout] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const root = useRef<HTMLDivElement>(null)
  const toggleEl = useRef<HTMLButtonElement>(null)
  const childrenEl = useRef<HTMLDivElement>(null)
  const showing = rail && flyout

  // Moved up when it would run past the bottom of the window.
  useLayoutEffect(() => {
    if (!showing || !childrenEl.current) return
    const top = Math.max(8, Math.min(position.top, innerHeight - childrenEl.current.offsetHeight - 8))
    if (top !== position.top) setPosition({ ...position, top })
  }, [showing, position])

  function showFlyout() {
    if (!rail || !toggleEl.current) return
    const box = toggleEl.current.getBoundingClientRect()
    setPosition({ top: box.top, left: box.right })
    setFlyout(true)
  }

  function toggle() {
    if (!rail) setOpen(!open)
    else if (showing) setFlyout(false)
    else showFlyout()
  }

  // Leaving by keyboard closes the flyout.
  function focusLeft(e: FocusEvent) {
    if (showing && !root.current?.contains(e.relatedTarget as Node | null)) setFlyout(false)
  }

  function escaped(e: KeyboardEvent) {
    if (e.key !== 'Escape' || !showing) return
    setFlyout(false)
    toggleEl.current?.focus()
  }

  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} ref={root} data-open={open || undefined}
      data-rail={rail || undefined} data-flyout={showing || undefined}
      onPointerEnter={showFlyout} onPointerLeave={() => setFlyout(false)} onBlur={focusLeft} onKeyDown={escaped}>
      <button {...part('trigger')} ref={toggleEl} type="button" aria-expanded={rail ? showing : open}
        aria-controls={`${id}-panel`} aria-label={rail ? label : undefined} onClick={toggle}>
        {icon && <iconify-icon {...part('icon')} icon={icon} aria-hidden="true" />}
        <span {...part('text')}>{label}</span>
        <iconify-icon {...part('indicator')} icon="lucide:chevron-down" aria-hidden="true" />
      </button>
      {(rail ? showing : open) && (
        <div {...part('children')} ref={childrenEl} id={`${id}-panel`} role="presentation"
          style={{ '--flyout-top': `${position.top}px`, '--flyout-left': `${position.left}px` } as CSSProperties}
          onClick={(e: MouseEvent) => { if ((e.target as Element).closest('a')) setFlyout(false) }}>
          <div {...part('panel')}>
            {rail && <div {...part('flyout-heading')} aria-hidden="true">{label}</div>}
            <FlyoutContext value={true}>{children}</FlyoutContext>
          </div>
        </div>
      )}
    </div>
  )
}
