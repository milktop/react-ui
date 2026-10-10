/**
 * A headline number with its label, e.g. on a dashboard.
 *
 *   <Stat label="Lessons this month" value={52} change={12.5} changeLabel="vs September" />
 *
 * - `value` (shown as given, so format it first) and an optional `unit`
 * - `change`: a number, shown as "+12.5%" with an arrow, green when up and red
 *   when down; `invert` swaps the colours (for things like cancellations);
 *   `changeUnit` replaces the '%'
 * - `changeLabel`, `help`: muted text after the change, and under it all
 * - `icon`: an Iconify name in a tinted square, beside the label
 * - `variant`: 'plain' (default) or 'card'
 * - `size`: 'sm', 'md' (default) or 'lg'
 * - the content goes under it all (a sparkline)
 *
 * Group stats in Stats for a responsive grid.
 */
import type { HTMLAttributes, ReactNode } from 'react'
import 'iconify-icon'
import { cx, partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './stat.css'

export type StatProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode
  value?: ReactNode
  unit?: ReactNode
  change?: number | null
  changeUnit?: string
  changeLabel?: ReactNode
  invert?: boolean
  help?: ReactNode
  icon?: string | null
  variant?: 'plain' | 'card'
  size?: 'sm' | 'md' | 'lg'
  classes?: Classes<'root' | 'header' | 'label' | 'icon' | 'value' | 'unit' | 'footer' | 'change' | 'changeLabel' | 'help'>
}

export function Stat({
  label = null, value = null, unit = null, change = null, changeUnit = '%', changeLabel = null, invert = false,
  help = null, icon = null, variant = 'plain', size = 'md', className, classes, children, ...rest
}: StatProps) {
  const part = partsOf('stat', classes)
  const direction = change == null || change === 0 ? 'flat' : change > 0 ? 'up' : 'down'
  const good = direction === 'flat' ? null : (direction === 'up') !== invert
  const changeText = `${change != null && change > 0 ? '+' : ''}${change}${changeUnit}`

  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} data-variant={variant} data-size={size}>
      <div {...part('header')}>
        <div {...part('label')}>{label}</div>
        {icon && <span {...part('icon')} aria-hidden="true"><iconify-icon icon={icon} /></span>}
      </div>
      <div {...part('value')}>
        <span>{value}</span>
        {unit && <span {...part('unit')}>{unit}</span>}
      </div>
      {(change != null || changeLabel) && (
        <div {...part('footer')}>
          {change != null && (
            <span {...part('change')} data-good={good === true || undefined} data-bad={good === false || undefined}
              aria-label={`${direction === 'up' ? 'Up' : direction === 'down' ? 'Down' : 'No change'} ${changeText}`}>
              {direction !== 'flat' && <iconify-icon icon={direction === 'down' ? 'lucide:trending-down' : 'lucide:trending-up'} />}
              {changeText}
            </span>
          )}
          {changeLabel && <span {...part('change-label')}>{changeLabel}</span>}
        </div>
      )}
      {help && <div {...part('help')}>{help}</div>}
      {children}
    </div>
  )
}
