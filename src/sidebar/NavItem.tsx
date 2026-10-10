/**
 * A sidebar link (or a button, without `href`). Other props (onClick,
 * data-*) go on the link.
 *
 *   <NavItem icon="lucide:users" href="/students" active={isCurrent('/students')} badge={3}>Students</NavItem>
 *   <NavItem icon="lucide:users" link={<Link to="/students" />}>Students</NavItem>
 *
 * - `icon`: an Iconify name
 * - `href`
 * - `link`: your router's link element to render in place of the <a>
 *   (`<Link to="…" />`); it gets the item's props and content
 * - `active`: the current page (sets aria-current)
 * - `badge`: a count or short text on the right (hidden at 0)
 * - `label`: its text, in place of the content
 *
 * In the rail only the icon shows, with its text in a tooltip (inside a
 * group's flyout the text stays); in the drawer, following a link closes it.
 */
import { Children, cloneElement, isValidElement, useContext, type AnchorHTMLAttributes, type MouseEvent, type ReactElement, type ReactNode } from 'react'
import 'iconify-icon'
import { Tooltip } from '../tooltip/Tooltip.js'
import { useShell } from '../app-shell/shell.js'
import { cx, partsOf, type Classes } from '../utils.js'
import { FlyoutContext } from './context.js'
import '../theme.css'
import './sidebar.css'

export type NavItemProps = Omit<AnchorHTMLAttributes<HTMLElement>, 'href'> & {
  icon?: string | null
  href?: string | null
  link?: ReactElement | null
  active?: boolean
  badge?: ReactNode
  label?: string | null
  classes?: Classes<'root' | 'link' | 'icon' | 'text' | 'badge'>
}

// The text of some content, for the rail's tooltip.
const textOf = (node: ReactNode): string => Children.toArray(node).map((child) =>
  typeof child === 'string' || typeof child === 'number' ? String(child)
    : isValidElement<{ children?: ReactNode }>(child) ? textOf(child.props.children) : '').join('').trim()

export function NavItem({
  icon = null, href = null, link = null, active = false, badge = null, label = null, onClick,
  className, classes, children, ...rest
}: NavItemProps) {
  const shell = useShell()
  const flyout = useContext(FlyoutContext)
  const part = partsOf('nav-item', classes)
  const rail = !!shell?.rail && !flyout
  const text = label ?? textOf(children)

  function follow(e: MouseEvent<HTMLElement>) {
    onClick?.(e)
    if ((href || link) && shell?.mobile) shell.close()
  }

  const props = {
    ...rest, ...part('link'), onClick: follow,
    'aria-current': active ? 'page' as const : undefined, 'aria-label': rail ? text : undefined,
  }
  const content = <>
    {icon && <iconify-icon {...part('icon')} icon={icon} aria-hidden="true" />}
    <span {...part('text')}>{children ?? label}</span>
    {badge !== null && badge !== undefined && badge !== 0 && <span {...part('badge')}>{badge}</span>}
  </>

  return (
    <div {...part('root')} className={cx(className, classes?.root)} data-active={active || undefined}>
      <Tooltip content={text} placement="right" disabled={!rail}>
        {link ? cloneElement(link, props, content)
          : href ? <a {...props} href={href}>{content}</a>
          : <button {...props} type="button">{content}</button>}
      </Tooltip>
    </div>
  )
}
