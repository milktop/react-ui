/**
 * A choice of colour from a few swatches, e.g. a vet's colour on the
 * calendar. The swatches are Tailwind's colours by default; their values are
 * the names ('teal'), or give your own.
 *
 *   <SwatchPicker label="Colour" value={color} onValueChange={setColor} />
 *   <SwatchPicker items={[{ value: 'brand', color: '#e11d48', label: 'Brand' }]} … />
 *
 * Arrow keys move between them, like radio buttons (which they are).
 *
 * - `items`: colour names from `swatches`, or `{ value, color, label }`
 *   (the default: every colour in `swatches`)
 * - `value`, `defaultValue`; `onValueChange`: called with the chosen value
 * - `label`: a label above it (skipped inside a Field); `size`: 'sm', 'md' or 'lg'
 * - `variant`: 'inline' (default: the swatches in the page) or 'popover': a
 *   field showing the chosen colour and its name, opening the swatches
 *   (closed once one's chosen); `placeholder` shows while none is
 *
 * `swatches` is the palette by name (Tailwind's 500s), e.g. for the
 * CSS colour of a chosen name: `swatches.teal`.
 */
import { useId, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { Popover } from '../popover/Popover.js'
import { RadioGroup as Ark, type RadioGroupValueChangeDetails } from '@ark-ui/react/radio-group'
import { useFieldContext } from '@ark-ui/react/field'
import '../icons.js'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './swatch-picker.css'

export const swatches: Record<string, string> = {
  slate: '#64748b', red: '#ef4444', orange: '#f97316', amber: '#f59e0b', yellow: '#eab308', lime: '#84cc16', green: '#22c55e',
  emerald: '#10b981', teal: '#14b8a6', cyan: '#06b6d4', sky: '#0ea5e9', blue: '#3b82f6', indigo: '#6366f1', violet: '#8b5cf6',
  purple: '#a855f7', fuchsia: '#d946ef', pink: '#ec4899', rose: '#f43f5e',
}

export type Swatch = { value: string, color: string, label?: string }

export type SwatchPickerProps = Omit<Ark.RootProps, 'value' | 'defaultValue' | 'onValueChange' | 'label'> & {
  items?: (string | Swatch)[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  label?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'inline' | 'popover'
  placeholder?: string
  classes?: Classes<'root' | 'label' | 'items' | 'item' | 'swatch' | 'trigger' | 'value' | 'indicator' | 'field' | 'chip'>
}

const capital = (name: string) => name.charAt(0).toUpperCase() + name.slice(1)

export function SwatchPicker({
  items = Object.keys(swatches), value, defaultValue = null, onValueChange, label = null, size = 'md', variant = 'inline',
  placeholder: placeholderProp, className, classes, ...rest
}: SwatchPickerProps) {
  const t = useMessages()
  const placeholder = placeholderProp ?? t.swatchPicker.placeholder
  const id = useId()
  const [open, setOpen] = useState(false)
  const field = useFieldContext()
  const part = partsOf('swatch-picker', classes)
  const [current, setCurrent] = useControllable(value, defaultValue, onValueChange)
  const list: Swatch[] = items.map((item) => (typeof item === 'string' ? { value: item, color: swatches[item] ?? item, label: t.swatchPicker.colors[item] ?? capital(item) } : item))

  const chosen = list.find((swatch) => swatch.value === current)
  const popover = variant === 'popover'

  const grid = (
    <Ark.Root {...(!popover && rest)} {...part('root')} className={popover ? classes?.root : cx(className, classes?.root)}
      orientation="horizontal" data-size={size} data-variant={variant}
      value={current} onValueChange={(d: RadioGroupValueChangeDetails) => { setCurrent(d.value); setOpen(false) }}
      aria-describedby={field?.ariaDescribedby}
      {...(popover && { 'aria-labelledby': field ? field.ids.label : label ? `${id}-label` : undefined })}
      {...(field && { ids: { label: field.ids.label }, invalid: field.invalid, disabled: field.disabled })}>
      {label && !field && !popover && <Ark.Label {...part('label')}>{label}</Ark.Label>}
      <div {...part('items')}>
        {list.map((swatch) => (
          <Ark.Item key={swatch.value} value={swatch.value} {...part('item')} title={swatch.label ?? swatch.value}
            style={{ '--swatch': swatch.color } as CSSProperties}>
            <Ark.ItemControl {...part('swatch')}><iconify-icon icon="lucide:check" aria-hidden="true" /></Ark.ItemControl>
            <Ark.ItemText {...part('item-text')}>{swatch.label ?? swatch.value}</Ark.ItemText>
            <Ark.ItemHiddenInput />
          </Ark.Item>
        ))}
      </div>
    </Ark.Root>
  )
  if (!popover) return grid

  // A field (like an input) showing the colour, opening the swatches.
  return (
    <div {...(rest as HTMLAttributes<HTMLDivElement>)} {...part('field')} className={cx(className, classes?.field)} data-size={size}>
      {label && !field && <span {...part('label')} id={`${id}-label`}>{label}</span>}
      <Popover placement="bottom-start" open={open} onOpenChange={setOpen} data-swatches="" trigger={
        // No id of the Field's here: Zag knows its trigger by its own id (with
        // another, a press on it counts as outside and closes it at once).
        <button type="button" {...part('trigger')} aria-haspopup="dialog"
          aria-labelledby={field || label ? `${field ? field.ids.label : `${id}-label`} ${id}-value` : undefined}
          aria-invalid={field?.invalid || undefined} disabled={field?.disabled}>
          <span {...part('chip')} style={{ '--swatch': chosen?.color ?? 'transparent' } as CSSProperties} data-empty={!chosen || undefined} />
          <span {...part('value')} id={`${id}-value`} data-placeholder={!chosen || undefined}>{chosen ? chosen.label ?? chosen.value : placeholder}</span>
          <iconify-icon {...part('indicator')} icon="lucide:chevron-down" aria-hidden="true" />
        </button>
      }>
        {grid}
      </Popover>
    </div>
  )
}
