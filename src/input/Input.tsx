/**
 * A text input: a box holding a native <input>, with optional content before
 * and after it. Other attributes (placeholder, name, autoComplete, onChange…)
 * go on the <input>.
 *
 *   <Input label="Name" value={name} onValueChange={setName} />
 *   <Input icon="lucide:search" placeholder="Search…" />
 *
 * - `label`: a label above it (skipped inside a Field)
 * - `value`, `defaultValue`: as on a native input
 * - `onValueChange`: called with the new value (a number for type="number")
 * - `type`: as on a native input
 * - `icon`: an Iconify name shown before the input
 * - `prefix`, `suffix`: text before or after it ('£', 'kg')
 * - `start`, `end`: anything else before or after it (a button)
 * - `size`: 'sm' or 'md'; `round`: a pill (a search box)
 *
 * By hand:
 *
 *   <Input.Root data-size="sm">
 *     <Input.Control><Input.Field placeholder="…" /><Button size="sm">Go</Button></Input.Control>
 *   </Input.Root>
 */
import { useId } from 'react'
import type { ChangeEvent, ComponentProps, HTMLInputTypeAttribute, ReactNode } from 'react'
import { Field, useFieldContext } from '@ark-ui/react/field'
import 'iconify-icon'
import { cx, partOf, partsOf, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './input.css'

// The input types React knows ('text', 'email'…), without its catch-all
// `string & {}`, which would also match 'number'.
type KnownType<T = HTMLInputTypeAttribute> = T extends unknown ? (string extends T ? never : T) : never

// onValueChange gets a number for type="number", a string otherwise.
type Typed =
  | { type: 'number', onValueChange?: (value: number) => void }
  | { type?: Exclude<KnownType, 'number'>, onValueChange?: (value: string) => void }

export type InputProps = Omit<ComponentProps<'input'>, 'size' | 'prefix' | 'type'> & Typed & {
  label?: ReactNode
  icon?: string | null
  prefix?: ReactNode
  suffix?: ReactNode
  start?: ReactNode
  end?: ReactNode
  size?: 'sm' | 'md'
  round?: boolean
  classes?: Classes<'root' | 'label' | 'control' | 'icon' | 'prefix' | 'input' | 'suffix'>
}

function InputShortcut({
  label = null, type = 'text', icon = null, prefix = null, suffix = null, size = 'md', round = false,
  start = null, end = null, onValueChange, onChange,
  className, classes, ...rest
}: InputProps) {
  const field = useFieldContext()
  const part = partsOf('input', classes)
  const ownId = useId()
  const id = rest.id ?? `${ownId}-input`

  function change(e: ChangeEvent<HTMLInputElement>) {
    onChange?.(e)
    const handler = onValueChange as ((value: string | number) => void) | undefined
    handler?.(type === 'number' ? e.target.valueAsNumber : e.target.value)
  }

  return (
    <div {...part('root')} className={cx(className, classes?.root)} data-size={size} data-round={round || undefined}>
      {label && !field && <label {...part('label')} htmlFor={id}>{label}</label>}
      <div {...part('control')}>
        {start ?? (icon ? <iconify-icon {...part('icon')} icon={icon} aria-hidden="true" />
          : prefix != null && <span {...part('prefix')}>{prefix}</span>)}
        {/* Inside a Field, Field.Input takes the field's id and describes itself by its hint or error. */}
        <Field.Input type={type} id={field ? undefined : id} {...rest} {...part('input')} onChange={change} />
        {end ?? (suffix != null && <span {...part('suffix')}>{suffix}</span>)}
      </div>
    </div>
  )
}

export const Input = withParts(InputShortcut, {
  Root: partOf('input', 'root'),
  Control: partOf('input', 'control'),
  Field: partOf('input', 'input', Field.Input),
})
