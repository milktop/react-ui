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

function SwitchShortcut({ onCheckedChange, label = null, className, classes, children, ...rest }: SwitchProps) {
  const part = partsOf('switch', classes)

  return (
    <Ark.Root {...rest} {...part('root')} className={cx(className, classes?.root)}
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
