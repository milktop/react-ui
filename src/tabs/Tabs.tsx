/**
 * Tabs: the Tabs.Tab children (also Tab) are the panels, and the tab list
 * is built from their labels.
 *
 *   <Tabs value={tab} onValueChange={setTab}>
 *     <Tabs.Tab value="lessons" label="Lessons" icon="lucide:calendar">…</Tabs.Tab>
 *     <Tabs.Tab value="invoices" label="Invoices" count={2} countColor="danger">…</Tabs.Tab>
 *   </Tabs>
 *
 * Arrow keys move between tabs (selecting as they go), Home/End jump to the
 * ends. With no value, the first enabled tab is selected.
 *
 * - `value`, `defaultValue`: the selected Tab's value; `onValueChange`: called with it
 * - `variant`: 'line' (default, an underline) or 'pills'
 * - `counts`: where the tabs' counts sit: 'inline' (default, after the label)
 *   or 'corner' (top right, like a button's)
 * - `iconOnly`: tabs with an icon show just the icon, their label in a
 *   tooltip (and still read out); tabs without one keep their label
 * - `renderTrigger`: a tab's content, given the tab's props; its count still follows
 * - `overflow`: what happens to tabs that don't fit: 'scroll' (default, the
 *   row scrolls sideways) or 'menu' (they move into a menu at the row's end,
 *   the selected tab always staying in the row)
 * - `moreLabel`: that menu's button
 *
 * By hand, with Ark's parts (data-variant on the root picks the look):
 *
 *   <Tabs.Root defaultValue="a" data-variant="pills">
 *     <Tabs.List>
 *       <Tabs.Trigger value="a">First <Tabs.Count>3</Tabs.Count></Tabs.Trigger>
 *       <Tabs.Trigger value="b">Second</Tabs.Trigger>
 *       <Tabs.Indicator />
 *     </Tabs.List>
 *     <Tabs.Content value="a">…</Tabs.Content>
 *     <Tabs.Content value="b">…</Tabs.Content>
 *   </Tabs.Root>
 */
import { Children, isValidElement, useEffect, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { Tabs as Ark, type TabsValueChangeDetails } from '@ark-ui/react/tabs'
import '../icons.js'
import { Menu } from '../menu/Menu.js'
import { Tooltip } from '../tooltip/Tooltip.js'
import { cx, partOf, partsOf, useControllable, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './tabs.css'

type Value = string | number

export type TabProps = Omit<Ark.ContentProps, 'value'> & {
  value: Value
  label?: ReactNode
  icon?: string | null
  disabled?: boolean
  count?: number | null
  max?: number
  dot?: boolean
  pulse?: boolean
  countColor?: 'neutral' | 'accent' | 'danger' | 'success' | 'warning'
  countLabel?: string
}

/**
 * One panel of a Tabs; `label` (and an optional `icon`) make its tab.
 *
 * - `value`: identifies it (the Tabs' value when selected)
 * - `label`: its text; `icon`: an Iconify name before it; `disabled`
 * - `count`: a small count after the label (hidden at 0 or null); past `max`
 *   it shows e.g. "99+"
 * - `dot`: a dot there instead, for "something to look at"
 * - `pulse`: a ring ripples out from the count or dot (not when the system
 *   asks for less motion)
 * - `countColor`: 'neutral' (default, quiet), 'accent', 'danger', 'success'
 *   or 'warning', for the dot too
 * - `countLabel`: what the count is, for assistive tech ("Invoices, 2 overdue")
 */
export function Tab({
  value, label: _label, icon: _icon, disabled: _disabled, count: _count, max: _max, dot: _dot, pulse: _pulse,
  countColor: _countColor, countLabel: _countLabel, className, ...rest
}: TabProps) {
  return <Ark.Content {...rest} value={String(value)} data-scope="tabs" data-part="content" className={className} />
}

export type TabsProps = Omit<Ark.RootProps, 'value' | 'defaultValue' | 'onValueChange'> & {
  value?: Value | null
  defaultValue?: Value | null
  onValueChange?: (value: Value | null, details: TabsValueChangeDetails) => void
  variant?: 'line' | 'pills'
  counts?: 'inline' | 'corner'
  iconOnly?: boolean
  renderTrigger?: (tab: TabProps) => ReactNode
  overflow?: 'scroll' | 'menu'
  moreLabel?: string
  classes?: Classes<'root' | 'list' | 'trigger' | 'tipTarget' | 'icon' | 'count' | 'indicator' | 'more' | 'panels' | 'content'>
}

const badgeOf = ({ count, max = 99, dot }: TabProps) => count && count > 0 ? (count > max ? `${max}+` : String(count)) : dot ? '' : null

/** The tabs that fit in `room` beside the menu's button, in order, the selected one always among them */
function fitting(widths: number[], more: number, gap: number, room: number, selected: number) {
  const all = widths.reduce((sum, width) => sum + width, 0) + gap * (widths.length - 1)
  if (all <= room) return null
  let left = room - more - (selected >= 0 ? widths[selected] + gap : 0)
  const kept = new Set(selected >= 0 ? [selected] : [])
  for (let index = 0; index < widths.length; index++) {
    if (index === selected) continue
    if (widths[index] + gap > left) break
    kept.add(index)
    left -= widths[index] + gap
  }
  return kept
}

function TabsShortcut({
  value, defaultValue, onValueChange, variant = 'line', counts = 'inline', iconOnly = false, renderTrigger, overflow = 'scroll',
  moreLabel = 'More', className, classes, children, ...rest
}: TabsProps) {
  const part = partsOf('tabs', classes)
  const tabs = Children.toArray(children).filter((child): child is ReactElement<TabProps> => isValidElement(child) && child.type === Tab)
  // With no value, the first enabled tab.
  const first = tabs.find((tab) => !tab.props.disabled)?.props.value ?? null
  const [current, setCurrent] = useControllable<Value | null>(value, defaultValue ?? first, undefined)
  const shown = current ?? first

  // A null value (controlled or not) selects the first enabled tab, and says so.
  useEffect(() => {
    if (current != null || first == null) return
    setCurrent(first)
    onValueChange?.(first, { value: String(first) })
  }, [current, first]) // eslint-disable-line react-hooks/exhaustive-deps

  // Zag's values are strings; map them back to the tabs' own.
  function change(details: TabsValueChangeDetails) {
    const next = tabs.find((tab) => String(tab.props.value) === details.value)?.props.value ?? null
    setCurrent(next)
    onValueChange?.(next, details)
  }

  // With a menu for what doesn't fit: every tab laid out unseen and measured; as many as fit stay in the row,
  // worked out as it renders, so a tab picked from the menu is in the row when the indicator moves to it
  const list = useRef<HTMLDivElement>(null)
  const measure = useRef<HTMLDivElement>(null)
  const [sizes, setSizes] = useState<{ widths: number[]; more: number; gap: number; room: number } | null>(null)
  const values = tabs.map((tab) => String(tab.props.value)).join('\n')

  useLayoutEffect(() => {
    if (overflow !== 'menu' || !list.current || !measure.current) return setSizes(null)
    const row = list.current
    const elements = [...measure.current.children] as HTMLElement[]
    const place = () => {
      // Hidden (an inactive panel of its own), it has no room to measure: keep what it had
      if (!row.clientWidth) return
      const widths = elements.map((element) => element.offsetWidth)
      const more = widths.pop()!
      const next = { widths, more, gap: parseFloat(getComputedStyle(row).columnGap) || 0, room: row.clientWidth }
      setSizes((current) => (current && JSON.stringify(current) === JSON.stringify(next) ? current : next))
    }
    place()
    const observer = new ResizeObserver(place)
    observer.observe(row)
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [overflow, values])

  const selected = tabs.findIndex((tab) => String(tab.props.value) === String(shown))
  // Tabs just added or taken away aren't measured yet: all of them, until they are
  const kept = sizes?.widths.length === tabs.length ? fitting(sizes.widths, sizes.more + sizes.gap, sizes.gap, sizes.room, selected) : null

  const inside = (tab: TabProps, measuring = false) => {
    const badge = badgeOf(tab)
    const { pulse, countColor = 'neutral', countLabel = '', count } = tab
    const spoken = count && count > 0 ? [count, countLabel].filter(Boolean).join(' ') : tab.dot ? countLabel : ''
    const bare = iconOnly && !!tab.icon
    return <>
      {renderTrigger ? renderTrigger(tab) : bare ? (measuring
        ? <span {...part('tip-target')}><iconify-icon {...part('icon')} icon={tab.icon!} /></span>
        : <>
          {/* On a span filling the tab: on the trigger itself its props would replace the tab's */}
          <Tooltip content={tab.label} placement="bottom">
            <span {...part('tip-target')}><iconify-icon {...part('icon')} icon={tab.icon!} aria-hidden="true" /></span>
          </Tooltip>
          <span {...part('sr-only')}>{tab.label}</span>
        </>) : <>
        {tab.icon && <iconify-icon {...part('icon')} icon={tab.icon} aria-hidden="true" />}
        <span>{tab.label}</span>
      </>}
      {badge != null && <>
        <span {...part('count')} aria-hidden="true" data-dot={badge === '' || undefined} data-pulse={pulse || undefined}
          data-color={countColor}>{badge}</span>
        {spoken && !measuring && <span {...part('sr-only')}>, {spoken}</span>}
      </>}
    </>
  }

  const moreButton = <button type="button" {...part('more')}>{moreLabel}<iconify-icon icon="lucide:chevron-down" aria-hidden="true" /></button>
  const hidden = kept ? tabs.filter((_, index) => !kept.has(index)) : []

  return (
    <Ark.Root {...rest} {...part('root')} className={cx(className, classes?.root)} data-variant={variant} data-counts={counts}
      value={shown == null ? null : String(shown)} onValueChange={change}>
      <Ark.List {...part('list')} ref={list}>
        {tabs.map(({ props: tab }, index) => (kept && !kept.has(index)) ? null : (
          <Ark.Trigger key={String(tab.value)} value={String(tab.value)} disabled={!!tab.disabled} {...part('trigger')}
            data-icon-only={(iconOnly && !!tab.icon) || undefined}>
            {inside(tab)}
          </Ark.Trigger>
        ))}
        {hidden.length > 0 && (
          <Menu placement="bottom-end" trigger={moreButton} onSelect={(picked) => change({ value: String(picked) } as TabsValueChangeDetails)}
            items={hidden.map(({ props: tab }) => ({ value: String(tab.value), label: tab.label, icon: tab.icon ?? undefined,
              disabled: !!tab.disabled, shortcut: badgeOf(tab) || undefined }))} />
        )}
        <Ark.Indicator {...part('indicator')} />
      </Ark.List>
      {overflow === 'menu' && (
        <div {...part('measure')} ref={measure} aria-hidden="true">
          {tabs.map(({ props: tab }) => (
            <span key={String(tab.value)} {...part('trigger')} data-icon-only={(iconOnly && !!tab.icon) || undefined}>{inside(tab, true)}</span>
          ))}
          <span {...part('more')}>{moreLabel}<iconify-icon icon="lucide:chevron-down" /></span>
        </div>
      )}
      <div {...part('panels')}>{children}</div>
    </Ark.Root>
  )
}

export const Tabs = withParts(TabsShortcut, {
  Tab,
  Root: Ark.Root,
  List: Ark.List,
  Trigger: Ark.Trigger,
  Indicator: Ark.Indicator,
  Content: Ark.Content,
  Context: Ark.Context,
  Count: partOf('tabs', 'count', 'span'),
})
