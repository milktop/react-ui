/**
 * The browser's own select, styled like our inputs: the phone's own picker,
 * long lists without search, and plain form posts.
 *
 *   <NativeSelect label="Species" items={['Dog', 'Cat', 'Rabbit']} value={species} onValueChange={setSpecies} />
 *
 * Inside a Field it takes the field's label, hint and error.
 *
 * - `items`: strings, or objects (see `labelKey`, `valueKey`, `disabledKey`;
 *   a `group` puts them under that heading)
 * - `value`, `defaultValue`: the item's own value; `onValueChange`: called with it
 * - `placeholder`: an empty first option (it can be chosen to clear it)
 * - `label`: a label above it (skipped inside a Field); `size`: 'sm', 'md' or 'lg'
 * - `name`, `required`, `disabled`: as on a <select>
 */
import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'
import { Field, useFieldContext } from '@ark-ui/react/field'
import 'iconify-icon'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import '../theme.css'
import './native-select.css'

type Value<T, K extends string> = T extends Record<string, unknown> ? T[K] : T

export type NativeSelectProps<T, K extends string = 'value'> = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'defaultValue' | 'size'> & {
  items: readonly T[]
  value?: NoInfer<Value<T, K>> | null
  defaultValue?: NoInfer<Value<T, K>> | null
  onValueChange?: (value: NoInfer<Value<T, K>> | null) => void
  placeholder?: string | null
  label?: ReactNode
  labelKey?: string
  valueKey?: K
  disabledKey?: string
  size?: 'sm' | 'md' | 'lg'
  classes?: Classes<'root' | 'label' | 'control' | 'select' | 'indicator'>
}

export function NativeSelect<T, K extends string = 'value'>({
  items, value, defaultValue, onValueChange, placeholder = null, label = null, labelKey = 'label', valueKey = 'value' as K,
  disabledKey = 'disabled', size = 'md', className, classes, ...rest
}: NativeSelectProps<T, K>) {
  const field = useFieldContext()
  const part = partsOf('native-select', classes)
  const id = useId()
  const [current, setCurrent] = useControllable<Value<T, K> | null>(value, defaultValue ?? null, onValueChange)

  const key = (item: T, k: string) => (item as Record<string, unknown>)[k]
  const isObject = (item: T) => typeof item === 'object' && item !== null
  const labelOf = (item: T) => String(isObject(item) ? key(item, labelKey) : item)
  const valueOf = (item: T) => (isObject(item) ? key(item, valueKey) : item) as Value<T, K>
  const groupOf = (item: T) => (isObject(item) ? key(item, 'group') as string | undefined : undefined)
  const option = (item: T) => (
    <option key={String(valueOf(item))} value={String(valueOf(item))} disabled={isObject(item) && !!key(item, disabledKey)}>{labelOf(item)}</option>
  )
  // Grouped items under their headings, in order of first appearance.
  const groups = [...new Set(items.map(groupOf))]

  // <select> values are strings: map back to the item's own.
  function change(raw: string) {
    const item = items.find((i) => String(valueOf(i)) === raw)
    setCurrent(item === undefined ? null : valueOf(item))
  }

  const props = {
    ...rest, ...part('select'), value: current == null ? '' : String(current),
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => { rest.onChange?.(e); change(e.target.value) },
  }
  const options = <>
    {placeholder !== null && <option value="">{placeholder}</option>}
    {groups.length > 1 || groups[0]
      ? groups.map((group) => group
          ? <optgroup key={group} label={group}>{items.filter((i) => groupOf(i) === group).map(option)}</optgroup>
          : items.filter((i) => !groupOf(i)).map(option))
      : items.map(option)}
  </>

  return (
    <div {...part('root')} className={cx(className, classes?.root)} data-size={size}>
      {label && !field && <label {...part('label')} htmlFor={id}>{label}</label>}
      <div {...part('control')}>
        {/* Inside a Field, Ark's Field.Select takes its ids, aria and invalid state. */}
        {field ? <Field.Select {...props}>{options}</Field.Select> : <select id={id} {...props}>{options}</select>}
        <iconify-icon {...part('indicator')} icon="lucide:chevron-down" aria-hidden="true" />
      </div>
    </div>
  )
}
