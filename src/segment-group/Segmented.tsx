/**
 * A segmented control: a row of options, one picked, with a sliding indicator.
 *
 *   <Segmented items={['Day', 'Week', 'Month']} value={view} onValueChange={setView} />
 *   <Segmented items={[{ value: 'grid', label: 'Grid', icon: 'lucide:grid-2x2' }]} iconOnly />
 *
 * - `items`: strings, or objects (see `labelKey`, `valueKey`, `disabledKey`; `icon`, `tooltip`)
 * - `value`, `defaultValue`: the item's own value; `onValueChange`: called with it
 * - `label`: a label above it (skipped inside a Field)
 * - `iconOnly`: just the icons (each keeps its label for assistive tech)
 * - `tooltips`: each item's label (or its own `tooltip`) in a tooltip on
 *   hover and keyboard focus; on by default with `iconOnly`
 * - `size`: 'sm', 'md' or 'lg'
 * - `renderItem`: an option's content, (item, { selected }) => node (a count
 *   beside the label, say); the icon still comes first
 * - `name`: for plain form posts
 *
 * By hand, with Ark's SegmentGroup parts (and Group, the track):
 *
 *   <Segmented.Root defaultValue="week" orientation="horizontal">
 *     <Segmented.Group>
 *       <Segmented.Indicator />
 *       {['day', 'week'].map((value) => (
 *         <Segmented.Item key={value} value={value}><Segmented.ItemText>{value}</Segmented.ItemText><Segmented.ItemHiddenInput /></Segmented.Item>
 *       ))}
 *     </Segmented.Group>
 *   </Segmented.Root>
 */
import { useState, type FocusEvent, type ReactNode } from 'react'
import { SegmentGroup as Ark, type SegmentGroupValueChangeDetails } from '@ark-ui/react/segment-group'
import { useFieldContext } from '@ark-ui/react/field'
import '../icons.js'
import { Tooltip } from '../tooltip/Tooltip.js'
import { cx, partOf, partsOf, useControllable, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './segment-group.css'

type Value<T, K extends string> = T extends string | number ? T : K extends keyof T ? T[K] : unknown

export type SegmentedProps<T, K extends string = 'value'> = Omit<Ark.RootProps, 'value' | 'defaultValue' | 'onValueChange' | 'label'> & {
  items: readonly T[]
  value?: NoInfer<Value<T, K>> | null
  defaultValue?: NoInfer<Value<T, K>> | null
  onValueChange?: (value: NoInfer<Value<T, K>> | null, details: SegmentGroupValueChangeDetails) => void
  label?: ReactNode
  labelKey?: string
  valueKey?: K
  disabledKey?: string
  iconOnly?: boolean
  tooltips?: boolean | null
  size?: 'sm' | 'md' | 'lg'
  renderItem?: (item: T, state: { selected: boolean }) => ReactNode
  classes?: Classes<'root' | 'label' | 'group' | 'indicator' | 'item' | 'itemText' | 'itemIcon' | 'tooltipTarget'>
}

function SegmentedShortcut<T, K extends string = 'value'>({
  items, value, defaultValue, onValueChange, label = null, labelKey = 'label', valueKey = 'value' as K, disabledKey = 'disabled',
  iconOnly = false, tooltips = null, size = 'md', renderItem, className, classes, ...rest
}: SegmentedProps<T, K>) {
  const field = useFieldContext()
  const part = partsOf('segment-group', classes)
  const [current, setCurrent] = useControllable<Value<T, K> | null>(value, defaultValue ?? null, undefined)

  const key = (item: T, k: string) => (item as Record<string, unknown>)[k]
  const isObject = (item: T) => typeof item === 'object' && item !== null
  const labelOf = (item: T) => String(isObject(item) ? key(item, labelKey) : item)
  const valueOf = (item: T) => (isObject(item) ? key(item, valueKey) : item) as Value<T, K>
  const iconOf = (item: T) => (isObject(item) ? key(item, 'icon') as string | undefined : undefined)
  const tipFor = (item: T) => (isObject(item) && key(item, 'tooltip') as ReactNode) || labelOf(item)

  // Zag's values are strings; map them back to the items' own.
  function change(details: SegmentGroupValueChangeDetails) {
    const item = items.find((item) => String(valueOf(item)) === details.value)
    const next = item === undefined ? null : valueOf(item)
    setCurrent(next)
    onValueChange?.(next, details)
  }

  const withTooltips = tooltips ?? iconOnly
  // The focusable element is the hidden radio, so keyboard focus opens its
  // tooltip by hand (pointer focus doesn't).
  const [tipOpen, setTipOpen] = useState<string | null>(null)
  const focus = (key: string) => (e: FocusEvent<HTMLInputElement>) => {
    if (withTooltips && e.target.matches(':focus-visible')) setTipOpen(key)
  }

  return (
    <Ark.Root {...rest} {...part('root')} className={cx(className, classes?.root)} data-size={size} orientation="horizontal"
      value={current == null ? null : String(current)} onValueChange={change} aria-describedby={field?.ariaDescribedby}
      // Inside a Field, its label names the group.
      {...(field && { ids: { label: field.ids.label }, invalid: field.invalid, disabled: field.disabled })}>
      {label && !field && <Ark.Label {...part('label')}>{label}</Ark.Label>}
      <div {...part('group')}>
        <Ark.Indicator {...part('indicator')} />
        {items.map((item) => {
          const itemKey = String(valueOf(item))
          return (
            <Ark.Item key={itemKey} value={itemKey} disabled={isObject(item) && !!key(item, disabledKey)} {...part('item')}
              data-icon-only={iconOnly || undefined}>
              <Ark.ItemText {...part('item-text')}>
                {iconOf(item) && <iconify-icon {...part('item-icon')} icon={iconOf(item)!} aria-hidden="true" />}
                {iconOnly ? <span {...part('sr-only')}>{labelOf(item)}</span>
                  : renderItem ? renderItem(item, { selected: String(current) === itemKey }) : labelOf(item)}
              </Ark.ItemText>
              {withTooltips && (
                // The tooltip's trigger is a layer over the item, since the item's own props are the radio's.
                <Tooltip content={tipFor(item)} open={tipOpen === itemKey}
                  onOpenChange={(open) => setTipOpen((tip) => (open ? itemKey : tip === itemKey ? null : tip))}>
                  <span {...part('tooltip-target')} />
                </Tooltip>
              )}
              <Ark.ItemHiddenInput onFocus={focus(itemKey)} onBlur={() => setTipOpen(null)} />
            </Ark.Item>
          )
        })}
      </div>
    </Ark.Root>
  )
}

export const Segmented = withParts(SegmentedShortcut, {
  Root: Ark.Root,
  Label: Ark.Label,
  Indicator: Ark.Indicator,
  Item: Ark.Item,
  ItemText: Ark.ItemText,
  ItemControl: Ark.ItemControl,
  ItemHiddenInput: Ark.ItemHiddenInput,
  Context: Ark.Context,
  Group: partOf('segment-group', 'group'),
})
