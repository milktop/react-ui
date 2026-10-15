/**
 * A number input with step buttons; arrow keys step too (Shift for 10).
 *
 *   <NumberInput label="Hourly rate" value={rate} onValueChange={setRate} min={0} step={5} prefix="£" />
 *
 * - `value`, `defaultValue`: a number, or null when empty
 * - `onValueChange`: called with the new number (or null)
 * - `min`, `max`, `step`
 * - `prefix`, `suffix`: text before or after it ('£', 'kg'); `icon`: an Iconify name before it
 * - `formatOptions`: Intl.NumberFormat options, e.g. { style: 'currency', currency: 'GBP' }, with `locale`
 * - `allowMouseWheel`: scroll over the focused input to step
 * - `steppers`: false to hide the buttons
 * - `name`: for plain form posts
 *
 * By hand, with Ark's parts:
 *
 *   <NumberInput.Root defaultValue="3" min={0}>
 *     <NumberInput.Label>Guests</NumberInput.Label>
 *     <NumberInput.Control>
 *       <NumberInput.DecrementTrigger>−</NumberInput.DecrementTrigger>
 *       <NumberInput.Input />
 *       <NumberInput.IncrementTrigger>+</NumberInput.IncrementTrigger>
 *     </NumberInput.Control>
 *   </NumberInput.Root>
 */
import { useState, type ReactNode } from 'react'
import { NumberInput as Ark, type NumberInputValueChangeDetails } from '@ark-ui/react/number-input'
import { useFieldContext } from '@ark-ui/react/field'
import '../icons.js'
import { cx, partsOf, withParts, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './number-input.css'

export type NumberInputProps = Omit<Ark.RootProps, 'value' | 'defaultValue' | 'onValueChange' | 'label' | 'prefix'> & {
  label?: ReactNode
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null, details: NumberInputValueChangeDetails) => void
  prefix?: ReactNode
  suffix?: ReactNode
  icon?: string | null
  steppers?: boolean
  placeholder?: string
  classes?: Classes<'root' | 'label' | 'control' | 'icon' | 'prefix' | 'input' | 'suffix' | 'decrementTrigger' | 'incrementTrigger'>
}

const toText = (value: number | null | undefined) => (value == null ? '' : String(value))

function NumberInputShortcut({
  label = null, value, defaultValue, onValueChange, prefix = null, suffix = null, icon = null, steppers = true, placeholder = '',
  className, classes, ...rest
}: NumberInputProps) {
  const t = useMessages()
  const field = useFieldContext()
  const part = partsOf('number-input', classes)

  // Zag works on the text ('1.', '' while typing); `value` is its number.
  // The text follows a controlled value that changes from outside.
  const [text, setText] = useState(() => toText(value !== undefined ? value : defaultValue))
  const [seen, setSeen] = useState(value)
  if (value !== seen) {
    setSeen(value)
    const number = text === '' ? null : Number(text)
    if (value !== number) setText(toText(value))
  }

  function change(details: NumberInputValueChangeDetails) {
    setText(details.value)
    onValueChange?.(Number.isNaN(details.valueAsNumber) ? null : details.valueAsNumber, details)
  }

  return (
    <Ark.Root {...(t.zag.numberInput && { translations: t.zag.numberInput })} {...rest} {...part('root')} className={cx(className, classes?.root)} value={text} onValueChange={change}>
      {label && !field && <Ark.Label {...part('label')}>{label}</Ark.Label>}
      <Ark.Control {...part('control')}>
        {icon ? <iconify-icon {...part('icon')} icon={icon} aria-hidden="true" />
          : prefix != null && <span {...part('prefix')}>{prefix}</span>}
        <Ark.Input {...part('input')} placeholder={placeholder} />
        {suffix != null && <span {...part('suffix')}>{suffix}</span>}
        {steppers && <>
          <Ark.DecrementTrigger {...part('decrement-trigger')}><iconify-icon icon="lucide:minus" /></Ark.DecrementTrigger>
          <Ark.IncrementTrigger {...part('increment-trigger')}><iconify-icon icon="lucide:plus" /></Ark.IncrementTrigger>
        </>}
      </Ark.Control>
    </Ark.Root>
  )
}

export const NumberInput = withParts(NumberInputShortcut, {
  Root: Ark.Root,
  Label: Ark.Label,
  Control: Ark.Control,
  Input: Ark.Input,
  DecrementTrigger: Ark.DecrementTrigger,
  IncrementTrigger: Ark.IncrementTrigger,
  ValueText: Ark.ValueText,
  Scrubber: Ark.Scrubber,
  Context: Ark.Context,
})
