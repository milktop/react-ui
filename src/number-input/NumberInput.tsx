/**
 * A number input with step buttons; arrow keys step too (Shift for 10).
 *
 *   <NumberInput label="Hourly rate" value={rate} onValueChange={setRate} min={0} step={5} prefix="£" />
 *
 * - `value`, `defaultValue`: a number, or null when empty
 * - `onValueChange`: called with the new number (or null)
 * - `min`, `max`, `step`
 * - `prefix`, `suffix`: text before or after it ('£', 'kg'); `icon`: an Iconify name before it
 * - `formatOptions`: Intl.NumberFormat options, e.g. { style: 'currency', currency: 'GBP' }
 * - `locale`: the number's language ('fr-FR' writes 4,25), else the LocaleProvider's; where the
 *   decimal is a comma and a point isn't a thousands separator (French), a typed point is a comma
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
import { useMemo, useState, type ReactNode } from 'react'
import { NumberInput as Ark, type NumberInputValueChangeDetails } from '@ark-ui/react/number-input'
import { useFieldContext } from '@ark-ui/react/field'
import { useLocaleContext } from '@ark-ui/react/locale'
import { NumberParser } from '@internationalized/number'
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

// Without formatOptions zag reads the text with parseFloat, which stops at a decimal comma.
const plain: Intl.NumberFormatOptions = { maximumFractionDigits: 15, useGrouping: false }

// A French keypad's decimal key types a point. Caught natively, before zag's
// onBeforeInput refuses it: on keydown, and on beforeinput for text typed
// without one (Chrome fires beforeinput before the textInput React reads).
const pointAsComma = (parser: NumberParser) => (input: HTMLInputElement | null) => {
  if (!input) return
  const insert = (event: Event, typed: string) => {
    event.preventDefault()
    const text = typed.replaceAll('.', ',')
    const start = input.selectionStart ?? input.value.length, end = input.selectionEnd ?? start
    if (!parser.isValidPartialNumber(input.value.slice(0, start) + text + input.value.slice(end))) return
    input.setRangeText(text, start, end, 'end')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }
  const key = (event: KeyboardEvent) => {
    if (event.key === '.' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.isComposing) insert(event, '.')
  }
  const beforeInput = (event: InputEvent) => {
    if (event.inputType === 'insertText' && event.data?.includes('.')) insert(event, event.data)
  }
  input.addEventListener('keydown', key)
  input.addEventListener('beforeinput', beforeInput)
  return () => {
    input.removeEventListener('keydown', key)
    input.removeEventListener('beforeinput', beforeInput)
  }
}

function numbers(locale: string, given?: Intl.NumberFormatOptions) {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234567.5)
  const decimal = parts.find((p) => p.type === 'decimal')?.value
  const group = parts.find((p) => p.type === 'group')?.value
  const formatOptions = given ?? (decimal === '.' ? undefined : plain)
  const format = new Intl.NumberFormat(locale, formatOptions)
  const parser = new NumberParser(locale, formatOptions)
  return {
    formatOptions,
    // Not where a point groups thousands (de-DE's 1.234).
    inputRef: decimal === ',' && group !== '.' ? pointAsComma(parser) : undefined,
    // As zag writes its value, so it reads it back.
    toText: (value: number | null | undefined) => (value == null ? '' : formatOptions ? format.format(value) : String(value)),
  }
}

function NumberInputShortcut({
  label = null, value, defaultValue, onValueChange, prefix = null, suffix = null, icon = null, steppers = true, placeholder = '',
  locale: localeProp, formatOptions: formatProp, className, classes, ...rest
}: NumberInputProps) {
  const t = useMessages()
  const field = useFieldContext()
  const part = partsOf('number-input', classes)
  const appLocale = useLocaleContext().locale
  const locale = localeProp ?? appLocale
  const key = JSON.stringify(formatProp ?? null)
  const { formatOptions, inputRef, toText } = useMemo(() => numbers(locale, formatProp), [locale, key]) // eslint-disable-line react-hooks/exhaustive-deps

  // Zag works on the text ('1,', '' while typing); `value` is its number.
  // The text follows a controlled value that changes from outside, not the
  // number it just reported.
  const [text, setText] = useState(() => toText(value !== undefined ? value : defaultValue))
  const [seen, setSeen] = useState(value)
  const [sent, setSent] = useState(value)
  if (value !== seen) {
    setSeen(value)
    setSent(value)
    if (value !== sent) setText(toText(value))
  }

  function change(details: NumberInputValueChangeDetails) {
    const number = Number.isNaN(details.valueAsNumber) ? null : details.valueAsNumber
    setText(details.value)
    setSent(number)
    onValueChange?.(number, details)
  }

  return (
    <Ark.Root {...(t.zag.numberInput && { translations: t.zag.numberInput })} {...rest} {...part('root')} className={cx(className, classes?.root)}
      locale={locale} {...(formatOptions && { formatOptions })} value={text} onValueChange={change}>
      {label && !field && <Ark.Label {...part('label')}>{label}</Ark.Label>}
      <Ark.Control {...part('control')}>
        {icon ? <iconify-icon {...part('icon')} icon={icon} aria-hidden="true" />
          : prefix != null && <span {...part('prefix')}>{prefix}</span>}
        <Ark.Input {...part('input')} placeholder={placeholder} ref={inputRef} />
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
