/**
 * Where the page sits: links from the top down to the current page.
 *
 *   <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Students' }]} />
 *
 * - `items`: `{ label, href, icon }`; the last is the current page
 * - `separator`: text between crumbs ('/', '›'); a chevron by default
 * - `max`: with more items than this, the middle ones fold into a "…" button
 *   that lists them in a menu
 * - `label`: what assistive tech calls the nav ('Breadcrumb')
 * - `renderLink`: draws a crumb's link yourself (your router's Link), given
 *   the crumb and the props to spread on it: `(item, props) => <Link to={item.href} {...props} />`
 */
import type { HTMLAttributes, ReactNode } from 'react'
import 'iconify-icon'
import { Menu } from '../menu/Menu.js'
import { cx, partsOf, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './breadcrumbs.css'

export type Crumb = { label: ReactNode, href?: string | null, icon?: string | null }
type CrumbLinkProps = { 'data-scope': string, 'data-part': string, className?: string, children: ReactNode }

export type BreadcrumbsProps = HTMLAttributes<HTMLElement> & {
  items?: Crumb[]
  separator?: ReactNode
  max?: number | null
  label?: string
  renderLink?: (item: Crumb, props: CrumbLinkProps) => ReactNode
  classes?: Classes<'root' | 'list' | 'crumb' | 'separator' | 'link' | 'more' | 'icon' | 'text'>
}

export function Breadcrumbs({
  items = [], separator = null, max = null, label: labelProp, renderLink, className, classes, ...rest
}: BreadcrumbsProps) {
  const t = useMessages()
  const label = labelProp ?? t.breadcrumbs.label
  const part = partsOf('breadcrumbs', classes)
  // The first crumb, a "…" for the folded middle, and the last max - 1.
  const folded = !!max && items.length > max
  const hidden = folded ? items.slice(1, items.length - (max - 1)) : []
  const shown: (Crumb | 'fold')[] = folded ? [items[0], 'fold', ...items.slice(items.length - (max - 1))] : items

  return (
    <nav {...rest} {...part('root')} className={cx(className, classes?.root)} aria-label={label}>
      <ol {...part('list')}>
        {shown.map((item, i) => {
          const current = i === shown.length - 1
          const content = item !== 'fold' && <>
            {item.icon && <iconify-icon {...part('icon')} icon={item.icon} aria-hidden="true" />}<span {...part('text')}>{item.label}</span>
          </>
          return (
            <li key={i} {...part('crumb')}>
              {i > 0 && (separator
                ? <span {...part('separator')} aria-hidden="true">{separator}</span>
                : <iconify-icon {...part('separator')} icon="lucide:chevron-right" aria-hidden="true" />)}
              {item === 'fold'
                // The folded crumbs, in a menu of links.
                ? <Menu items={hidden.map((crumb, j) => ({ label: crumb.label, value: j, href: crumb.href ?? undefined, icon: crumb.icon ?? undefined }))}
                    trigger={<button {...part('more')} type="button" aria-label={t.common.more(hidden.length)}>…</button>} />
                : item.href && !current
                  ? renderLink ? renderLink(item, { ...part('link'), children: content }) : <a {...part('link')} href={item.href}>{content}</a>
                  : <span {...part('link')} data-current={current || undefined} aria-current={current ? 'page' : undefined}>{content}</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
