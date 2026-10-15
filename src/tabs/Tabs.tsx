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
 * - `renderTrigger`: a tab's content, given the tab's props; its count still follows
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
import { Children, isValidElement, useEffect, type ReactElement, type ReactNode } from 'react'
import { Tabs as Ark, type TabsValueChangeDetails } from '@ark-ui/react/tabs'
import '../icons.js'
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
  renderTrigger?: (tab: TabProps) => ReactNode
  classes?: Classes<'root' | 'list' | 'trigger' | 'icon' | 'count' | 'indicator' | 'panels' | 'content'>
}

function TabsShortcut({
  value, defaultValue, onValueChange, variant = 'line', counts = 'inline', renderTrigger, className, classes, children, ...rest
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

  return (
    <Ark.Root {...rest} {...part('root')} className={cx(className, classes?.root)} data-variant={variant} data-counts={counts}
      value={shown == null ? null : String(shown)} onValueChange={change}>
      <Ark.List {...part('list')}>
        {tabs.map(({ props: tab }) => {
          const { count, max = 99, dot, pulse, countColor = 'neutral', countLabel = '' } = tab
          const badge = count && count > 0 ? (count > max ? `${max}+` : String(count)) : dot ? '' : null
          const spoken = count && count > 0 ? [count, countLabel].filter(Boolean).join(' ') : dot ? countLabel : ''
          return (
            <Ark.Trigger key={String(tab.value)} value={String(tab.value)} disabled={!!tab.disabled} {...part('trigger')}>
              {renderTrigger ? renderTrigger(tab) : <>
                {tab.icon && <iconify-icon {...part('icon')} icon={tab.icon} aria-hidden="true" />}
                <span>{tab.label}</span>
              </>}
              {badge != null && <>
                <span {...part('count')} aria-hidden="true" data-dot={badge === '' || undefined} data-pulse={pulse || undefined}
                  data-color={countColor}>{badge}</span>
                {spoken && <span {...part('sr-only')}>, {spoken}</span>}
              </>}
            </Ark.Trigger>
          )
        })}
        <Ark.Indicator {...part('indicator')} />
      </Ark.List>
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
