/**
 * An app sidebar: a logo, the nav, and a footer. In an AppShell it collapses
 * to an icon rail (its button, or ⌘B) and becomes a drawer on phones.
 *
 *   <Sidebar logo="TutorApp" footer={<Sidebar.User name="Ada Lovelace" items={account} />}>
 *     <Sidebar.Section heading="Menu">
 *       <Sidebar.Item icon="lucide:house" href="/" active>Dashboard</Sidebar.Item>
 *       <Sidebar.Group label="Settings" icon="lucide:settings">…</Sidebar.Group>
 *     </Sidebar.Section>
 *   </Sidebar>
 *
 * - `logo`; `logoCollapsed`: shown instead in the rail (a mark)
 * - `footer`: along the bottom (a Sidebar.User)
 * - `accordion`: one Sidebar.Group open at a time
 * - `items`: the nav as data, in place of (or before) the content:
 *   `[{ heading, items: [{ label, icon, href, active, badge, items }] }]`
 * - `edge`: a thin strip along the right edge that collapses or expands it
 *   on click: 'rail' (default) shows it only while collapsed, true always,
 *   false never
 * - `label`: the nav's accessible name ('Main')
 * - restyle its items with the `--ui-sidebar-*` tokens, e.g.
 *   style={{ '--ui-sidebar-active': 'var(--ui-accent-soft)' }}
 *
 * Its parts are on it: Sidebar.Section, Sidebar.Group, Sidebar.Item and
 * Sidebar.User (also exported as NavSection, NavGroup, NavItem and SidebarUser).
 */
import { useMemo, useState, type HTMLAttributes, type ReactNode } from 'react'
import '../icons.js'
import { Tooltip } from '../tooltip/Tooltip.js'
import { useShell } from '../app-shell/shell.js'
import { cx, partsOf, withParts, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import { SidebarContext, type SidebarState } from './context.js'
import { NavSection } from './NavSection.js'
import { NavGroup } from './NavGroup.js'
import { NavItem } from './NavItem.js'
import { SidebarUser } from './SidebarUser.js'
import '../theme.css'
import './sidebar.css'

export type SidebarLink = { label: string, icon?: string, href?: string, active?: boolean, badge?: ReactNode, items?: SidebarLink[] }
export type SidebarSection = { heading?: ReactNode, items?: SidebarLink[] }

export type SidebarProps = HTMLAttributes<HTMLElement> & {
  logo?: ReactNode
  logoCollapsed?: ReactNode
  footer?: ReactNode
  accordion?: boolean
  items?: SidebarSection[] | null
  edge?: 'rail' | boolean
  label?: string
  classes?: Classes<'root' | 'header' | 'logo' | 'toggle' | 'nav' | 'footer' | 'edge'>
}

function SidebarShortcut({
  logo = null, logoCollapsed = null, footer = null, accordion = false, items = null, edge = 'rail', label: labelProp,
  className, classes, children, ...rest
}: SidebarProps) {
  const t = useMessages()
  const label = labelProp ?? t.shell.nav
  const shell = useShell()
  const part = partsOf('sidebar', classes)
  const rail = !!shell?.rail

  // The open accordion group, by id.
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const sidebar = useMemo<SidebarState>(() => ({ accordion, openGroup, setOpenGroup }), [accordion, openGroup])

  const toggleButton = (expand: boolean) => (
    <Tooltip content={`${expand ? t.shell.expandSidebar : t.shell.collapseSidebar} (⌘B)`} placement="right">
      <button {...part('toggle')} type="button" onClick={shell?.toggle} aria-label={expand ? t.shell.expandSidebar : t.shell.collapseSidebar}>
        <iconify-icon icon={expand ? 'lucide:panel-left-open' : 'lucide:panel-left-close'} aria-hidden="true" />
      </button>
    </Tooltip>
  )

  return (
    <SidebarContext value={sidebar}>
      <aside {...rest} {...part('root')} className={cx(className, classes?.root)} data-rail={rail || undefined}
        data-mobile={shell?.mobile || undefined} data-open={shell?.drawerOpen || undefined}>
        {(logo || shell) && (
          <div {...part('header')}>
            {rail
              ? logoCollapsed && <div {...part('logo')}>{logoCollapsed}</div>
              : <>
                  {logo && <div {...part('logo')}>{logo}</div>}
                  {shell?.mobile
                    ? <button {...part('toggle')} type="button" onClick={shell.toggle} aria-label={t.shell.closeMenu}>
                        <iconify-icon icon="lucide:x" aria-hidden="true" />
                      </button>
                    : shell && toggleButton(false)}
                </>}
          </div>
        )}
        <nav {...part('nav')} aria-label={label}>
          {(items ?? []).map((section, i) => (
            <NavSection key={i} heading={section.heading}>
              {(section.items ?? []).map((item, j) => item.items
                ? <NavGroup key={j} label={item.label} icon={item.icon} defaultOpen={item.items.some((child) => child.active)}>
                    {item.items.map((child, k) => (
                      <NavItem key={k} href={child.href} icon={child.icon} active={child.active} badge={child.badge} label={child.label} />
                    ))}
                  </NavGroup>
                : <NavItem key={j} href={item.href} icon={item.icon} active={item.active} badge={item.badge} label={item.label} />)}
            </NavSection>
          ))}
          {children}
        </nav>
        {(footer || rail) && (
          <div {...part('footer')}>
            {footer}
            {rail && toggleButton(true)}
          </div>
        )}
        {/* Mouse only: keyboard users have the buttons above and ⌘B. It never
            takes focus (mousedown is prevented), so no focus ring is left behind. */}
        {shell && !shell.mobile && (edge === 'rail' ? rail : edge) && (
          <button {...part('edge')} type="button" tabIndex={-1} aria-hidden="true" title={rail ? t.shell.expandSidebar : t.shell.collapseSidebar}
            onMouseDown={(e) => e.preventDefault()} onClick={shell.toggle} />
        )}
      </aside>
    </SidebarContext>
  )
}

export const Sidebar = withParts(SidebarShortcut, { Section: NavSection, Group: NavGroup, Item: NavItem, User: SidebarUser })
