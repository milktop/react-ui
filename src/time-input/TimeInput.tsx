/**
 * A time of day, typed or picked with the browser's own time control (a wheel
 * on phones), as 'HH:mm'.
 *
 *   <TimeInput label="Starts" value={time} onValueChange={setTime} step={15} min="08:00" max="18:00" />
 *
 * Inside a Field it takes the field's label, hint and error. (For booking
 * from free slots, show the slots instead: a free time picked here can clash.)
 *
 * - `value`, `defaultValue`: 'HH:mm' (or null); `onValueChange`: called with it
 * - `step`: minutes between times (1); the arrow keys move by it
 * - `min`, `max`: 'HH:mm'
 * - `icon`: an Iconify name before it ('lucide:clock'; null for none)
 * - and Input's props: `label`, `size`, `disabled`, `name`…
 */
import { Input, type InputProps } from '../input/Input.js'

export type TimeInputProps = Omit<InputProps, 'type' | 'value' | 'defaultValue' | 'onValueChange' | 'step' | 'min' | 'max'> & {
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  step?: number
  min?: string
  max?: string
}

export function TimeInput({ value, defaultValue, onValueChange, step = 1, icon = 'lucide:clock', ...rest }: TimeInputProps) {
  return (
    <Input {...rest} type="time" icon={icon} step={step * 60}
      {...(value !== undefined && { value: value ?? '' })} {...(defaultValue != null && { defaultValue })}
      onValueChange={(next: string) => onValueChange?.(next || null)} />
  )
}
