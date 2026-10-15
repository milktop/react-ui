/**
 * The app's top bar: content on the left, `end` on the right. In an AppShell
 * on a phone it starts with a button opening the sidebar drawer.
 *
 *   <Topbar end={<Button icon="lucide:bell" aria-label="Notifications" />}>
 *     <Breadcrumbs items={trail} />
 *   </Topbar>
 *
 * - `end`: actions on the right
 */
import type { HTMLAttributes, ReactNode } from 'react'
import '../icons.js'
import { cx, partsOf, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import { useShell } from './shell.js'
import '../theme.css'
import './app-shell.css'

export type TopbarProps = HTMLAttributes<HTMLElement> & {
  end?: ReactNode
  classes?: Classes<'root' | 'menu' | 'start' | 'end'>
}

export function Topbar({ end = null, className, classes, children, ...rest }: TopbarProps) {
  const t = useMessages()
  const shell = useShell()
  const part = partsOf('topbar', classes)

  return (
    <header {...rest} {...part('root')} className={cx(className, classes?.root)}>
      {shell?.mobile && (
        <button {...part('menu')} type="button" aria-label={t.shell.openMenu} aria-expanded={shell.drawerOpen} onClick={shell.toggle}>
          <iconify-icon icon="lucide:menu" aria-hidden="true" />
        </button>
      )}
      <div {...part('start')}>{children}</div>
      {end && <div {...part('end')}>{end}</div>}
    </header>
  )
}
