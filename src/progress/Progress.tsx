/**
 * A progress indicator, as a bar or a circle.
 *
 *   <Progress label="Course" value={64} showValue />
 *   <Progress variant="circle" value={80} showValue />
 *
 * - `value`: from `min` to `max` (0 to 100); null means indeterminate, for
 *   work of unknown length
 * - `label`, `showValue`: a label and the formatted value (a percentage by
 *   default; see `formatOptions`, `locale`)
 * - `translations.value`: writes the value text, ({ value, max, percent }) => '3 of 4'
 * - `variant`: 'linear' (default) or 'circle'; `size` and `thickness` set the
 *   circle's diameter and stroke in px
 *
 * By hand, with Ark's parts:
 *
 *   <Progress.Root value={40}>
 *     <Progress.Label>Upload</Progress.Label> <Progress.ValueText />
 *     <Progress.Track><Progress.Range /></Progress.Track>
 *   </Progress.Root>
 */
import type { CSSProperties, ReactNode } from 'react'
import { Progress as Ark } from '@ark-ui/react/progress'
import { useLocale } from '../format/LocaleProvider.js'
import { cx, partOf, partsOf, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './progress.css'

export type ProgressProps = Omit<Ark.RootProps, 'value' | 'defaultValue' | 'label'> & {
  value?: number | null
  label?: ReactNode
  showValue?: boolean
  variant?: 'linear' | 'circle'
  size?: number
  thickness?: number
  classes?: Classes<'root' | 'header' | 'label' | 'valueText' | 'track' | 'range' | 'circleWrap' | 'circle' | 'circleTrack' | 'circleRange'>
}

// The value as Zag writes it (formatOptions, translations.value); Ark's
// ValueText would show the percentage whatever they say.
const ValueText = (props: Ark.ValueTextProps) =>
  <Ark.Context>{(api) => <Ark.ValueText {...props}>{api.valueAsString}</Ark.ValueText>}</Ark.Context>

function ProgressShortcut({
  value = null, min = 0, max = 100, label = null, showValue = false, variant = 'linear', size = 48, thickness = 5,
  locale: localeProp, className, classes, ...rest
}: ProgressProps) {
  const app = useLocale()
  const locale = localeProp ?? app ?? 'en-GB'
  const part = partsOf('progress', classes)
  return (
    // Zag treats a missing value as the midpoint, and null as indeterminate.
    <Ark.Root {...rest} {...part('root')} className={cx(className, classes?.root)} data-variant={variant}
      value={value} min={min} max={max} locale={locale}>
      {(label || (showValue && variant === 'linear')) && (
        <div {...part('header')}>
          {label && <Ark.Label {...part('label')}>{label}</Ark.Label>}
          {showValue && variant === 'linear' && <ValueText {...part('value-text')} />}
        </div>
      )}
      {variant === 'circle' ? (
        <div {...part('circle-wrap')} style={{ '--size': `${size}px`, '--thickness': `${thickness}px` } as CSSProperties}>
          <Ark.Circle {...part('circle')}>
            <Ark.CircleTrack {...part('circle-track')} />
            <Ark.CircleRange {...part('circle-range')} />
          </Ark.Circle>
          {showValue && <ValueText {...part('value-text')} />}
        </div>
      ) : (
        <Ark.Track {...part('track')}><Ark.Range {...part('range')} /></Ark.Track>
      )}
    </Ark.Root>
  )
}

export const Progress = withParts(ProgressShortcut, {
  Root: Ark.Root,
  Label: Ark.Label,
  ValueText: Ark.ValueText,
  Track: Ark.Track,
  Range: Ark.Range,
  Circle: Ark.Circle,
  CircleTrack: Ark.CircleTrack,
  CircleRange: Ark.CircleRange,
  Context: Ark.Context,
  Header: partOf('progress', 'header'),
  CircleWrap: partOf('progress', 'circle-wrap'),
})
