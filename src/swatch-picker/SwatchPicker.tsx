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
 *
 * `swatches` is the palette by name (Tailwind's 500s), e.g. for the
 * CSS colour of a chosen name: `swatches.teal`.
 */
import type { CSSProperties, ReactNode } from 'react'
import { RadioGroup as Ark, type RadioGroupValueChangeDetails } from '@ark-ui/react/radio-group'
import { useFieldContext } from '@ark-ui/react/field'
import 'iconify-icon'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
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
  classes?: Classes<'root' | 'label' | 'items' | 'item' | 'swatch'>
}

const capital = (name: string) => name.charAt(0).toUpperCase() + name.slice(1)

export function SwatchPicker({
  items = Object.keys(swatches), value, defaultValue = null, onValueChange, label = null, size = 'md', className, classes, ...rest
}: SwatchPickerProps) {
  const field = useFieldContext()
  const part = partsOf('swatch-picker', classes)
  const [current, setCurrent] = useControllable(value, defaultValue, onValueChange)
  const list: Swatch[] = items.map((item) => (typeof item === 'string' ? { value: item, color: swatches[item] ?? item, label: capital(item) } : item))

  return (
    <Ark.Root {...rest} {...part('root')} className={cx(className, classes?.root)} orientation="horizontal" data-size={size}
      value={current} onValueChange={(d: RadioGroupValueChangeDetails) => setCurrent(d.value)}
      aria-describedby={field?.ariaDescribedby}
      {...(field && { ids: { label: field.ids.label }, invalid: field.invalid, disabled: field.disabled })}>
      {label && !field && <Ark.Label {...part('label')}>{label}</Ark.Label>}
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
}
