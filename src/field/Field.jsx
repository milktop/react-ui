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
 *   onValueChange, type, placeholder, icon, suffix…) pass on to it
 *
 * By hand, with Ark's Field parts:
 *
 *   <Field.Root invalid={!!error}>
 *     <Field.Label>Email <Field.RequiredIndicator /></Field.Label>
 *     <Input />
 *     <Field.ErrorText>{error}</Field.ErrorText>
 *   </Field.Root>
 */
import { Field as Ark } from '@ark-ui/react/field'
import { Input } from '../input/Input.jsx'
import { cx, partsOf, withParts } from '../utils.js'
import '../theme.css'
import './field.css'

function FieldShortcut({
  label = null, hint = null, error = null, required = false, disabled = false, span = 12,
  className, classes, style, children, ...inputProps
}) {
  const part = partsOf('field', classes)

  return (
    <Ark.Root {...part('root')} className={cx(className, classes?.root)} style={{ '--span': span, ...style }}
      invalid={!!error} required={required} disabled={disabled}>
      {label && <Ark.Label {...part('label')}>{label}<Ark.RequiredIndicator {...part('required-indicator')} aria-hidden="true"> *</Ark.RequiredIndicator></Ark.Label>}
      {children ?? <Input {...inputProps} />}
      {error ? <Ark.ErrorText {...part('error-text')}>{error}</Ark.ErrorText>
        : hint && <Ark.HelperText {...part('helper-text')}>{hint}</Ark.HelperText>}
    </Ark.Root>
  )
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
export function Fields({ legend = null, description = null, className, classes, children, ...rest }) {
  const part = partsOf('fields', classes)

  return (
    <fieldset {...rest} {...part('root')} className={cx(className, classes?.root)}>
      {legend && <legend {...part('legend')}>{legend}</legend>}
      {description && <p {...part('description')}>{description}</p>}
      <div {...part('grid')}>{children}</div>
    </fieldset>
  )
}
