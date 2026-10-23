/**
 * A form field: a label, hint and error around one control, wired up for
 * assistive tech. Controls inside it (Input, Select, Checkbox…) skip their
 * own label and point at its.
 *
 *   <Field label="Student" error={errors.student}>
 *     <Select items={students} value={student} onValueChange={setStudent} />
 *   </Field>
 *
 * - `label`, `hint`, `error` (shown instead of the hint), `required`
 * - `span`: columns (of 12) to take inside Fields
 * - without children it renders an Input, and the other props (value,
 *   onValueChange, type, placeholder, icon, suffix…) pass on to it; with
 *   type="number" a NumberInput (value a number or null, min, max, step…)
 *
 *     <Field label="Rate" type="number" min={0} prefix="£" value={rate} onValueChange={setRate} />
 *
 * By hand, with Ark's Field parts:
 *
 *   <Field.Root invalid={!!error}>
 *     <Field.Label>Email <Field.RequiredIndicator /></Field.Label>
 *     <Input />
 *     <Field.ErrorText>{error}</Field.ErrorText>
 *   </Field.Root>
 */
import type { ComponentProps, CSSProperties, ReactNode } from 'react'
import { Field as Ark } from '@ark-ui/react/field'
import { Input, type InputProps } from '../input/Input.js'
import { NumberInput, type NumberInputProps } from '../number-input/NumberInput.js'
import { cx, partsOf, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './field.css'

// Omit, kept per member of InputProps' union (type="number" or not).
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

type Control =
  | DistributiveOmit<Exclude<InputProps, { type: 'number' }>, 'label' | 'classes' | 'children'>
  | (Omit<NumberInputProps, 'label' | 'classes' | 'children'> & { type: 'number' })

export type FieldProps = Control & {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  disabled?: boolean
  span?: number
  classes?: Classes<'root' | 'label' | 'requiredIndicator' | 'helperText' | 'errorText'>
  children?: ReactNode
}

function FieldShortcut({
  label = null, hint = null, error = null, required = false, disabled = false, span = 12,
  className, classes, style, children, ...inputProps
}: FieldProps) {
  const part = partsOf('field', classes)

  return (
    <Ark.Root {...part('root')} className={cx(className, classes?.root)} style={{ '--span': span, ...style } as CSSProperties}
      invalid={!!error} required={required} disabled={disabled}>
      {label && <Ark.Label {...part('label')}>{label}<Ark.RequiredIndicator {...part('required-indicator')} aria-hidden="true"> *</Ark.RequiredIndicator></Ark.Label>}
      {children ?? control(inputProps)}
      {error ? <Ark.ErrorText {...part('error-text')}>{error}</Ark.ErrorText>
        : hint && <Ark.HelperText {...part('helper-text')}>{hint}</Ark.HelperText>}
    </Ark.Root>
  )
}

function control({ type, ...props }: Omit<Control, 'classes'>) {
  if (type === 'number') return <NumberInput {...props as NumberInputProps} />
  return <Input type={type} {...props as InputProps} />
}

export const Field = withParts(FieldShortcut, {
  Root: Ark.Root,
  Label: Ark.Label,
  RequiredIndicator: Ark.RequiredIndicator,
  HelperText: Ark.HelperText,
  ErrorText: Ark.ErrorText,
  Context: Ark.Context,
})

/**
 * A group of fields on a 12-column grid (one column on phones). Each Field
 * takes `span` columns.
 *
 *   <Fields legend="Lesson">
 *     <Field label="Student" span={6}>…</Field>
 *     <Field label="Date" span={6}>…</Field>
 *   </Fields>
 *
 * - `legend`, `description`: a heading for the group
 */
export type FieldsProps = ComponentProps<'fieldset'> & {
  legend?: ReactNode
  description?: ReactNode
  classes?: Classes<'root' | 'legend' | 'description' | 'grid'>
}

export function Fields({ legend = null, description = null, className, classes, children, ...rest }: FieldsProps) {
  const part = partsOf('fields', classes)

  return (
    <fieldset {...rest} {...part('root')} className={cx(className, classes?.root)}>
      {legend && <legend {...part('legend')}>{legend}</legend>}
      {description && <p {...part('description')}>{description}</p>}
      <div {...part('grid')}>{children}</div>
    </fieldset>
  )
}
