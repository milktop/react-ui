/**
 * A checkbox with its label.
 *
 *   <Checkbox checked={agreed} onCheckedChange={setAgreed}>I agree to the terms</Checkbox>
 *
 * - `checked`, `defaultChecked`: true, false or 'indeterminate'
 * - `onCheckedChange`: called with the new checked state (a boolean)
 * - `label`: its text (or children, for richer content)
 * - `labelHidden`: keep the label for assistive tech only (a table's row checkbox)
 * - `indicator`: replaces the tick and dash; a node, or ({ indeterminate }) => node
 * - `name`, `value`: for plain form posts
 * - `disabled`, `invalid`, `required`
 *
 * By hand, with Ark's parts:
 *
 *   <Checkbox.Root>
 *     <Checkbox.Control>
 *       <Checkbox.Indicator>✓</Checkbox.Indicator>
 *       <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
 *     </Checkbox.Control>
 *     <Checkbox.Label>Terms</Checkbox.Label>
 *     <Checkbox.HiddenInput />
 *   </Checkbox.Root>
 */
import type { ReactNode } from 'react'
import { Checkbox as Ark, type CheckboxCheckedChangeDetails } from '@ark-ui/react/checkbox'
import '../icons.js'
import { cx, on, partsOf, slot, withParts, type Classes, type Slot } from '../utils.js'
import '../theme.css'
import './checkbox.css'

export type CheckboxProps = Omit<Ark.RootProps, 'onCheckedChange' | 'label'> & {
  // A click never leaves it indeterminate, so this gets a boolean.
  onCheckedChange?: (checked: boolean, details: CheckboxCheckedChangeDetails) => void
  label?: ReactNode
  labelHidden?: boolean
  indicator?: Slot<{ indeterminate: boolean }>
  classes?: Classes<'root' | 'control' | 'indicator' | 'label'>
}

function CheckboxShortcut({
  onCheckedChange, label = null, labelHidden = false, indicator,
  className, classes, children, ...rest
}: CheckboxProps) {
  const part = partsOf('checkbox', classes)

  return (
    <Ark.Root {...rest} {...part('root')} className={cx(className, classes?.root)}
      {...on('onCheckedChange', onCheckedChange, (details: CheckboxCheckedChangeDetails) => details.checked === true)}>
      <Ark.Control {...part('control')}>
        <Ark.Indicator {...part('indicator')}>
          {slot(indicator, <iconify-icon icon="lucide:check" aria-hidden="true" />, { indeterminate: false })}
        </Ark.Indicator>
        <Ark.Indicator {...part('indicator')} indeterminate>
          {slot(indicator, <iconify-icon icon="lucide:minus" aria-hidden="true" />, { indeterminate: true })}
        </Ark.Indicator>
      </Ark.Control>
      {(label || children) && <Ark.Label {...part('label')} data-hidden={labelHidden || undefined}>{children ?? label}</Ark.Label>}
      <Ark.HiddenInput />
    </Ark.Root>
  )
}

export const Checkbox = withParts(CheckboxShortcut, {
  Root: Ark.Root,
  Control: Ark.Control,
  Indicator: Ark.Indicator,
  Label: Ark.Label,
  HiddenInput: Ark.HiddenInput,
  Group: Ark.Group,
  Context: Ark.Context,
})
