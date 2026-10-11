/**
 * A group of radio buttons: pick one.
 *
 *   <RadioGroup label="Lesson length" items={['30 min', '45 min', '60 min']} value={length} onValueChange={setLength} />
 *
 * - `items`: strings, or objects (see `labelKey`, `valueKey`, `disabledKey`; `description`)
 * - `value`, `defaultValue`: the item's own value; `onValueChange`: called with it
 * - `label`: a label above it (skipped inside a Field)
 * - `orientation`: 'vertical' or 'horizontal'
 * - `variant`: 'list' (default), or 'cards': each option a bordered card
 *   (with its `description`, and an `icon` from the item), chosen one outlined
 * - `name`: for plain form posts
 *
 * By hand, with Ark's parts:
 *
 *   <RadioGroup.Root defaultValue="45">
 *     <RadioGroup.Label>Length</RadioGroup.Label>
 *     {['30', '45'].map((value) => (
 *       <RadioGroup.Item key={value} value={value}>
 *         <RadioGroup.ItemControl /><RadioGroup.ItemText>{value} min</RadioGroup.ItemText><RadioGroup.ItemHiddenInput />
 *       </RadioGroup.Item>
 *     ))}
 *   </RadioGroup.Root>
 */
import type { ReactNode } from 'react'
import { RadioGroup as Ark, type RadioGroupValueChangeDetails } from '@ark-ui/react/radio-group'
import { useFieldContext } from '@ark-ui/react/field'
import 'iconify-icon'
import { cx, partOf, partsOf, useControllable, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './radio-group.css'

type Value<T, K extends string> = T extends string | number ? T : K extends keyof T ? T[K] : unknown

export type RadioGroupProps<T, K extends string = 'value'> = Omit<Ark.RootProps, 'value' | 'defaultValue' | 'onValueChange' | 'label'> & {
  items: readonly T[]
  value?: NoInfer<Value<T, K>> | null
  defaultValue?: NoInfer<Value<T, K>> | null
  onValueChange?: (value: NoInfer<Value<T, K>> | null, details: RadioGroupValueChangeDetails) => void
  label?: ReactNode
  labelKey?: string
  valueKey?: K
  disabledKey?: string
  variant?: 'list' | 'cards'
  classes?: Classes<'root' | 'label' | 'items' | 'item' | 'itemControl' | 'icon' | 'text' | 'itemText' | 'description'>
}

function RadioGroupShortcut<T, K extends string = 'value'>({
  items, value, defaultValue, onValueChange, label = null, orientation = 'vertical', variant = 'list',
  labelKey = 'label', valueKey = 'value' as K, disabledKey = 'disabled', className, classes, ...rest
}: RadioGroupProps<T, K>) {
  const field = useFieldContext()
  const part = partsOf('radio-group', classes)
  const [current, setCurrent] = useControllable<Value<T, K> | null>(value, defaultValue ?? null, undefined)

  const key = (item: T, k: string) => (item as Record<string, unknown>)[k]
  const isObject = (item: T) => typeof item === 'object' && item !== null
  const labelOf = (item: T) => String(isObject(item) ? key(item, labelKey) : item)
  const valueOf = (item: T) => (isObject(item) ? key(item, valueKey) : item) as Value<T, K>
  const descriptionOf = (item: T) => (isObject(item) ? key(item, 'description') as ReactNode : null)
  const iconOf = (item: T) => (isObject(item) ? key(item, 'icon') as string | undefined : undefined)

  // Zag's values are strings; map them back to the items' own.
  function change(details: RadioGroupValueChangeDetails) {
    const item = items.find((item) => String(valueOf(item)) === details.value)
    const next = item === undefined ? null : valueOf(item)
    setCurrent(next)
    onValueChange?.(next, details)
  }

  return (
    <Ark.Root {...rest} {...part('root')} className={cx(className, classes?.root)} orientation={orientation} data-variant={variant}
      value={current == null ? null : String(current)} onValueChange={change} aria-describedby={field?.ariaDescribedby}
      // Inside a Field, its label names the group.
      {...(field && { ids: { label: field.ids.label }, invalid: field.invalid, disabled: field.disabled })}>
      {label && !field && <Ark.Label {...part('label')}>{label}</Ark.Label>}
      <div {...part('items')}>
        {items.map((item) => (
          <Ark.Item key={String(valueOf(item))} value={String(valueOf(item))} disabled={isObject(item) && !!key(item, disabledKey)} {...part('item')}>
            <Ark.ItemControl {...part('item-control')} />
            {iconOf(item) && <iconify-icon {...part('icon')} icon={iconOf(item)!} aria-hidden="true" />}
            <span {...part('text')}>
              <Ark.ItemText {...part('item-text')}>{labelOf(item)}</Ark.ItemText>
              {descriptionOf(item) && <span {...part('description')}>{descriptionOf(item)}</span>}
            </span>
            <Ark.ItemHiddenInput />
          </Ark.Item>
        ))}
      </div>
    </Ark.Root>
  )
}

export const RadioGroup = withParts(RadioGroupShortcut, {
  Root: Ark.Root,
  Label: Ark.Label,
  Item: Ark.Item,
  ItemControl: Ark.ItemControl,
  ItemText: Ark.ItemText,
  ItemHiddenInput: Ark.ItemHiddenInput,
  Indicator: Ark.Indicator,
  Context: Ark.Context,
  Items: partOf('radio-group', 'items'),
})
