/**
 * An on/off switch with its label.
 *
 *   <Switch checked={reminders} onCheckedChange={setReminders}>Email reminders</Switch>
 *
 * - `checked`, `defaultChecked`
 * - `onCheckedChange`: called with the new checked state
 * - `label`: its text (or children)
 * - `name`, `value`: for plain form posts
 * - `disabled`, `invalid`, `required`
 *
 * Inside a Field, one with a label keeps its own ids, so several can share it
 * (the Field's label heads them); one without is the Field's control, named by
 * its label. Ark's Root by hand always takes the Field's ids.
 *
 * By hand, with Ark's parts:
 *
 *   <Switch.Root>
 *     <Switch.Control><Switch.Thumb /></Switch.Control>
 *     <Switch.Label>Reminders</Switch.Label>
 *     <Switch.HiddenInput />
 *   </Switch.Root>
 */
import type { ReactNode } from 'react'
import { Switch as Ark, type SwitchCheckedChangeDetails } from '@ark-ui/react/switch'
import { cx, on, partsOf, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './switch.css'

export type SwitchProps = Omit<Ark.RootProps, 'onCheckedChange' | 'label'> & {
  onCheckedChange?: (checked: boolean, details: SwitchCheckedChangeDetails) => void
  label?: ReactNode
  classes?: Classes<'root' | 'control' | 'thumb' | 'label'>
}

// Ark hands a control inside a Field the Field's ids. One with a label of its own is a
// control of its own (one of several, say), so it keeps its own; ids from the caller win.
const ownIds = {}

function SwitchShortcut({ onCheckedChange, label = null, className, classes, children, ...rest }: SwitchProps) {
  const part = partsOf('switch', classes)

  return (
    <Ark.Root {...((label || children) && { ids: ownIds })} {...rest} {...part('root')} className={cx(className, classes?.root)}
      {...on('onCheckedChange', onCheckedChange, (details: SwitchCheckedChangeDetails) => details.checked)}>
      <Ark.Control {...part('control')}><Ark.Thumb {...part('thumb')} /></Ark.Control>
      {(label || children) && <Ark.Label {...part('label')}>{children ?? label}</Ark.Label>}
      <Ark.HiddenInput />
    </Ark.Root>
  )
}

export const Switch = withParts(SwitchShortcut, {
  Root: Ark.Root,
  Control: Ark.Control,
  Thumb: Ark.Thumb,
  Label: Ark.Label,
  HiddenInput: Ark.HiddenInput,
  Context: Ark.Context,
})
