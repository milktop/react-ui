/**
 * A group of checkboxes, for an array of checked values.
 *
 *   <CheckboxGroup label="Subjects" items={['Maths', 'Physics', 'Chemistry']} value={subjects} onValueChange={setSubjects} selectAll="All subjects" />
 *
 * - `items`: strings, or objects (see `labelKey`, `valueKey`, `disabledKey`)
 * - `value`, `defaultValue`: the checked items' own values, in item order;
 *   `onValueChange`: called with the new array
 * - `selectAll`: label for a parent checkbox that selects all or none, and is
 *   indeterminate when only some are (disabled items keep their state)
 * - `label`: a label above it (skipped inside a Field)
 * - `orientation`: 'vertical' or 'horizontal'
 * - `name`: each checkbox posts its value with plain forms
 *
 * Shift-clicking a checkbox ticks (or clears) every item between it and the
 * last one clicked, as in mail and file lists.
 */
import { useId, useRef, type ComponentProps, type ReactNode, type SyntheticEvent } from 'react'
import { useFieldContext } from '@ark-ui/react/field'
import { Checkbox } from './Checkbox.js'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import '../theme.css'
import './checkbox.css'

type Value<T, K extends string> = T extends string | number ? T : K extends keyof T ? T[K] : unknown

export type CheckboxGroupProps<T, K extends string = 'value'> = Omit<ComponentProps<'div'>, 'defaultValue'> & {
  items: readonly T[]
  value?: NoInfer<Value<T, K>>[]
  defaultValue?: NoInfer<Value<T, K>>[]
  onValueChange?: (value: NoInfer<Value<T, K>>[]) => void
  label?: ReactNode
  selectAll?: ReactNode
  orientation?: 'vertical' | 'horizontal'
  labelKey?: string
  valueKey?: K
  disabledKey?: string
  name?: string
  disabled?: boolean
  classes?: Classes<'root' | 'label' | 'items'>
}

export function CheckboxGroup<T, K extends string = 'value'>({
  items, value, defaultValue, onValueChange, label = null, selectAll = null, orientation = 'vertical',
  labelKey = 'label', valueKey = 'value' as K, disabledKey = 'disabled', name, disabled = false,
  className, classes, ...rest
}: CheckboxGroupProps<T, K>) {
  const field = useFieldContext()
  const part = partsOf('checkbox-group', classes)
  const id = useId()
  const [checked, setChecked] = useControllable<Value<T, K>[]>(value, defaultValue ?? [], onValueChange)

  const key = (item: T, k: string) => (item as Record<string, unknown>)[k]
  const isObject = (item: T) => typeof item === 'object' && item !== null
  const labelOf = (item: T) => String(isObject(item) ? key(item, labelKey) : item)
  const valueOf = (item: T) => (isObject(item) ? key(item, valueKey) : item) as Value<T, K>
  const isSelected = (item: T) => checked.includes(valueOf(item))
  const isLocked = (item: T) => disabled || (isObject(item) && !!key(item, disabledKey))
  const select = (list: T[]) => setChecked(list.map(valueOf))

  // Checkbox changes don't carry the Shift key, so it's noted on the way in
  // (Shift+mousedown would also select the labels' text between).
  const shift = useRef(false)
  const anchor = useRef<number | null>(null)
  function noteShift(e: SyntheticEvent & { shiftKey: boolean }) {
    shift.current = e.shiftKey
    if (e.shiftKey && e.type === 'mousedown') e.preventDefault()
  }

  function toggle(item: T, on: boolean) {
    const index = items.indexOf(item)
    const from = anchor.current
    anchor.current = index
    if (shift.current && from != null && from !== index && items[from]) {
      const [lo, hi] = [Math.min(from, index), Math.max(from, index)]
      return select(items.filter((it, n) => (n >= lo && n <= hi && !isLocked(it) ? on : isSelected(it))))
    }
    select(items.filter((it) => (it === item ? on : isSelected(it))))
  }

  const toggleAll = (on: boolean) => select(items.filter((it) => (isLocked(it) ? isSelected(it) : on)))

  // The select-all box: checked when every enabled item is, indeterminate when only some are.
  const open = items.filter((it) => !isLocked(it))
  const on = open.filter(isSelected).length
  const allState = on === 0 ? false : on === open.length ? true : 'indeterminate'

  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} role="group"
      aria-labelledby={field ? field.ids.label : label ? `${id}-label` : undefined}>
      {label && !field && <span {...part('label')} id={`${id}-label`}>{label}</span>}
      {selectAll && <Checkbox label={selectAll} disabled={disabled} checked={allState} onCheckedChange={toggleAll} />}
      <div {...part('items')} data-orientation={orientation} data-indented={selectAll ? '' : undefined}
        onPointerDownCapture={noteShift} onMouseDownCapture={noteShift} onKeyDownCapture={noteShift}>
        {items.map((item) => (
          <Checkbox key={String(valueOf(item))} label={labelOf(item)} value={String(valueOf(item))} disabled={isLocked(item)}
            {...(name && { name })} checked={isSelected(item)} onCheckedChange={(on) => toggle(item, on)} />
        ))}
      </div>
    </div>
  )
}
