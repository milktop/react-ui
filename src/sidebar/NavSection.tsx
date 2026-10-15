/**
 * A group of nav items, with an optional heading (hidden in the rail).
 *
 *   <Sidebar.Section heading="Settings" collapsible>…groups…</Sidebar.Section>
 *
 * - `heading`
 * - `collapsible`: a button beside the heading that collapses (or expands)
 *   all the section's groups at once
 */
import { useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import '../icons.js'
import { useShell } from '../app-shell/shell.js'
import { cx, partsOf, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import { SectionContext, type SectionState } from './context.js'
import '../theme.css'
import './sidebar.css'

export type NavSectionProps = HTMLAttributes<HTMLDivElement> & {
  heading?: ReactNode
  collapsible?: boolean
  classes?: Classes<'root' | 'headingRow' | 'heading' | 'collapseAll'>
}

export function NavSection({ heading = null, collapsible = false, className, classes, children, ...rest }: NavSectionProps) {
  const t = useMessages()
  const shell = useShell()
  const part = partsOf('nav-section', classes)
  const setters = useRef(new Map<string, (open: boolean) => void>())
  const [openIds, setOpenIds] = useState<string[]>([])
  const anyOpen = openIds.length > 0

  const section = useMemo<SectionState>(() => ({
    register(id, setOpen) {
      setters.current.set(id, setOpen)
      return () => {
        setters.current.delete(id)
        setOpenIds((ids) => ids.filter((other) => other !== id))
      }
    },
    report(id, open) {
      setOpenIds((ids) => (open === ids.includes(id) ? ids : open ? [...ids, id] : ids.filter((other) => other !== id)))
    },
  }), [])

  function toggleAll() {
    for (const setOpen of setters.current.values()) setOpen(!anyOpen)
  }

  const toggleLabel = anyOpen ? t.shell.collapseAll : t.shell.expandAll
  return (
    <SectionContext value={section}>
      <div {...rest} {...part('root')} className={cx(className, classes?.root)} role="group"
        aria-label={typeof heading === 'string' ? heading : undefined}>
        {(heading || collapsible) && (
          <div {...part('heading-row')}>
            <div {...part('heading')} aria-hidden="true">{heading}</div>
            {collapsible && !shell?.rail && (
              <button {...part('collapse-all')} type="button" onClick={toggleAll} aria-label={toggleLabel} title={toggleLabel}>
                <iconify-icon icon={anyOpen ? 'lucide:chevrons-down-up' : 'lucide:chevrons-up-down'} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </SectionContext>
  )
}
