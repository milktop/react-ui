/**
 * A small toolbar floating at the bottom of the screen while something is
 * selected, e.g. table rows.
 *
 *   <ActionBar open={picked.length > 0} onClose={() => setPicked([])} selection={`${picked.length} selected`}>
 *     <Button size="sm">Message</Button>
 *     <Button size="sm" variant="danger">Archive</Button>
 *   </ActionBar>
 *
 * It isn't modal: the page stays usable (keep ticking rows) and focus isn't
 * moved. It's rendered at the end of <body>, a toolbar for assistive tech,
 * centred over the main area beside an AppShell's sidebar.
 *
 * - `open`: shows it
 * - `selection`: the count or summary on the left
 * - `closable`: false hides the close button; it (and Escape inside the bar)
 *   calls `onClose`, where you'd clear the selection
 * - `label`: the toolbar's accessible name
 */
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react'
import { Portal } from '@ark-ui/react/portal'
import '../icons.js'
import { cx, partsOf, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './action-bar.css'

export type ActionBarProps = ComponentProps<'div'> & {
  open?: boolean
  closable?: boolean
  label?: string
  onClose?: (() => void) | null
  selection?: ReactNode
  classes?: Classes<'positioner' | 'content' | 'selection' | 'separator' | 'actions' | 'close'>
}

export function ActionBar({
  open = false, closable = true, label: labelProp, onClose = null, selection = null,
  className, classes, children, ...rest
}: ActionBarProps) {
  const t = useMessages()
  const label = labelProp ?? t.actionBar.label
  const part = partsOf('action-bar', classes)
  // Kept in the page until its closing animation ends (or 300 ms, if none
  // runs, as with reduced motion).
  const [present, setPresent] = useState(open)
  if (open && !present) setPresent(true)
  useEffect(() => {
    if (open || !present) return
    const timer = setTimeout(() => setPresent(false), 300)
    return () => clearTimeout(timer)
  }, [open, present])

  if (!present) return null
  return (
    <Portal>
      <div {...part('positioner')}>
        <div {...rest} {...part('content')} className={cx(className, classes?.content)} role="toolbar" aria-label={label}
          data-state={open ? 'open' : 'closed'}
          onAnimationEnd={(e) => { if (e.target === e.currentTarget && !open) setPresent(false) }}
          onKeyDown={(e) => { if (e.key === 'Escape') onClose?.() }}>
          {selection != null && <><div {...part('selection')}>{selection}</div><span {...part('separator')} aria-hidden="true" /></>}
          <div {...part('actions')}>{children}</div>
          {closable && <button {...part('close')} type="button" aria-label={t.common.close} onClick={() => onClose?.()}><iconify-icon icon="lucide:x" /></button>}
        </div>
      </div>
    </Portal>
  )
}
