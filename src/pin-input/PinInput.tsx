/**
 * A code input: one box per character, for verification codes and PINs.
 *
 *   <PinInput label="Code" count={6} value={code} onValueChange={setCode} onComplete={verify} />
 *
 * - `value`, `defaultValue`: a string; `onValueChange`: called with it
 * - `count`: how many boxes (4)
 * - `type`: 'numeric', 'alphabetic' or 'alphanumeric'
 * - `mask`: hide the characters, like a password
 * - `placeholder`: shown in each empty box (none)
 * - `otp`: offer one-time codes from the keyboard (autocomplete="one-time-code")
 * - `onComplete`: called with the value once every box is filled
 * - `name`: for plain form posts
 *
 * By hand, with Ark's parts:
 *
 *   <PinInput.Root count={4}>
 *     <PinInput.Label>PIN</PinInput.Label>
 *     <PinInput.Control>{[0, 1, 2, 3].map((index) => <PinInput.Input key={index} index={index} />)}</PinInput.Control>
 *     <PinInput.HiddenInput />
 *   </PinInput.Root>
 */
import type { ReactNode } from 'react'
import { PinInput as Ark, type PinInputValueChangeDetails } from '@ark-ui/react/pin-input'
import { useFieldContext } from '@ark-ui/react/field'
import { cx, partsOf, withParts, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './pin-input.css'

export type PinInputProps = Omit<Ark.RootProps, 'value' | 'defaultValue' | 'onValueChange' | 'onValueComplete' | 'label'> & {
  label?: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string, details: PinInputValueChangeDetails) => void
  onComplete?: (value: string, details: PinInputValueChangeDetails) => void
  classes?: Classes<'root' | 'label' | 'control' | 'input'>
}

function PinInputShortcut({
  label = null, count = 4, type = 'numeric', placeholder = '', value, defaultValue, onValueChange, onComplete,
  className, classes, ...rest
}: PinInputProps) {
  const t = useMessages()
  const field = useFieldContext()
  const part = partsOf('pin-input', classes)
  const boxes = (text: string) => text.split('').slice(0, count)

  return (
    <Ark.Root {...(t.zag.pinInput && { translations: t.zag.pinInput })} {...rest} {...part('root')} className={cx(className, classes?.root)} count={count} type={type} placeholder={placeholder}
      {...(value !== undefined && { value: boxes(value) })}
      {...(defaultValue !== undefined && { defaultValue: boxes(defaultValue) })}
      {...(onValueChange && { onValueChange: (details) => onValueChange(details.valueAsString, details) })}
      {...(onComplete && { onValueComplete: (details) => onComplete(details.valueAsString, details) })}>
      {label && !field && <Ark.Label {...part('label')}>{label}</Ark.Label>}
      <Ark.Control {...part('control')}>
        {Array.from({ length: count }, (_, index) => <Ark.Input key={index} index={index} {...part('input')} />)}
      </Ark.Control>
      <Ark.HiddenInput />
    </Ark.Root>
  )
}

export const PinInput = withParts(PinInputShortcut, {
  Root: Ark.Root,
  Label: Ark.Label,
  Control: Ark.Control,
  Input: Ark.Input,
  HiddenInput: Ark.HiddenInput,
  Context: Ark.Context,
})
