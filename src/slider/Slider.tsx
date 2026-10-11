/**
 * A slider: pick a number, or a range with two thumbs.
 *
 *   <Slider label="Volume" value={volume} onValueChange={setVolume} />
 *   <Slider label="Price" value={range} onValueChange={setRange} min={0} max={100} step={5} />  (range = [20, 80])
 *
 * - `value`, `defaultValue`: a number, or an array of two for a range
 * - `onValueChange`: called with the new value (the same shape)
 * - `min`, `max`, `step`
 * - `showValue`: the value beside the label, formatted with `formatOptions` and `locale`
 *   (e.g. { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })
 * - `marks`: values (or { value, label }) shown as ticks under the track
 * - `name`: for plain form posts
 *
 * By hand, with Ark's parts:
 *
 *   <Slider.Root defaultValue={[40]}>
 *     <Slider.Label>Volume</Slider.Label> <Slider.ValueText />
 *     <Slider.Control>
 *       <Slider.Track><Slider.Range /></Slider.Track>
 *       <Slider.Thumb index={0}><Slider.HiddenInput /></Slider.Thumb>
 *     </Slider.Control>
 *   </Slider.Root>
 */
import { useMemo, type ReactNode } from 'react'
import { Slider as Ark, type SliderValueChangeDetails } from '@ark-ui/react/slider'
import { useFieldContext } from '@ark-ui/react/field'
import { useLocale } from '../format/LocaleProvider.js'
import { cx, partOf, partsOf, useControllable, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './slider.css'

type Mark = number | { value: number, label: ReactNode }

type One = { value?: number, defaultValue?: number, onValueChange?: (value: number, details: SliderValueChangeDetails) => void }
type Range = { value?: number[], defaultValue?: number[], onValueChange?: (value: number[], details: SliderValueChangeDetails) => void }

export type SliderProps = Omit<Ark.RootProps, 'value' | 'defaultValue' | 'onValueChange' | 'label'> & {
  label?: ReactNode
  showValue?: boolean
  formatOptions?: Intl.NumberFormatOptions
  locale?: string
  marks?: Mark[] | null
  classes?: Classes<'root' | 'header' | 'label' | 'valueText' | 'control' | 'track' | 'range' | 'thumb' | 'markerGroup' | 'marker'>
} & (One | Range)

function SliderShortcut(props: SliderProps) {
  const {
    label = null, value, defaultValue, onValueChange, min = 0, max = 100, step = 1, showValue = true,
    formatOptions, locale: localeProp, marks = null, className, classes, ...rest
  } = props as SliderProps & { value?: number | number[], defaultValue?: number | number[], onValueChange?: (value: number | number[], details: SliderValueChangeDetails) => void }
  const field = useFieldContext()
  const part = partsOf('slider', classes)
  const [own, setOwn] = useControllable<number | number[]>(value, defaultValue ?? min, undefined)
  const range = Array.isArray(own)
  const app = useLocale()
  const locale = localeProp ?? app
  const formatter = useMemo(() => new Intl.NumberFormat(locale, formatOptions), [locale, formatOptions])
  const format = (n: number) => formatter.format(n)
  const markOf = (mark: Mark) => (typeof mark === 'object' ? mark : { value: mark, label: format(mark) })

  function change(details: SliderValueChangeDetails) {
    const next = range ? details.value : details.value[0]
    setOwn(next)
    onValueChange?.(next, details)
  }
  const values = Array.isArray(own) ? own : [own]

  return (
    <Ark.Root {...rest} {...part('root')} className={cx(className, classes?.root)} min={min} max={max} step={step}
      thumbAlignment="center" value={values} onValueChange={change}
      // Inside a Field, its label names the slider.
      {...(field && { ids: { label: field.ids.label }, invalid: field.invalid, disabled: field.disabled })}>
      {((label && !field) || showValue) && (
        <div {...part('header')}>
          {label && !field && <Ark.Label {...part('label')}>{label}</Ark.Label>}
          {showValue && <Ark.ValueText {...part('value-text')}>{values.map(format).join(' – ')}</Ark.ValueText>}
        </div>
      )}
      <Ark.Control {...part('control')}>
        <Ark.Track {...part('track')}><Ark.Range {...part('range')} /></Ark.Track>
        {values.map((_, index) => <Ark.Thumb key={index} index={index} {...part('thumb')} aria-describedby={field?.ariaDescribedby}><Ark.HiddenInput /></Ark.Thumb>)}
      </Ark.Control>
      {marks && (
        <Ark.MarkerGroup {...part('marker-group')}>
          {marks.map(markOf).map((mark) => <Ark.Marker key={mark.value} value={mark.value} {...part('marker')}>{mark.label}</Ark.Marker>)}
        </Ark.MarkerGroup>
      )}
    </Ark.Root>
  )
}

export const Slider = withParts(SliderShortcut, {
  Root: Ark.Root,
  Label: Ark.Label,
  ValueText: Ark.ValueText,
  Control: Ark.Control,
  Track: Ark.Track,
  Range: Ark.Range,
  Thumb: Ark.Thumb,
  HiddenInput: Ark.HiddenInput,
  MarkerGroup: Ark.MarkerGroup,
  Marker: Ark.Marker,
  Context: Ark.Context,
  Header: partOf('slider', 'header'),
})
