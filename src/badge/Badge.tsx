/**
 * A short label, like a status or a count.
 *
 *   <Badge variant="success" dot>Paid</Badge>
 *
 * - `variant`: 'neutral' (default), 'accent', 'success', 'warning', 'danger' or 'outline'
 * - `size`: 'sm' or 'md'
 * - `icon`: an Iconify name before the text; `dot`: a coloured dot instead
 */
import type { ComponentProps } from 'react'
import 'iconify-icon'
import { cx, partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './badge.css'

export type BadgeProps = ComponentProps<'span'> & {
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'outline'
  size?: 'sm' | 'md'
  icon?: string | null
  dot?: boolean
  classes?: Classes<'root' | 'dot' | 'icon'>
}

export function Badge({ variant = 'neutral', size = 'md', icon = null, dot = false, className, classes, children, ...rest }: BadgeProps) {
  const part = partsOf('badge', classes)
  return (
    <span {...rest} {...part('root')} className={cx(className, classes?.root)} data-variant={variant} data-size={size}>
      {dot ? <span {...part('dot')} aria-hidden="true" />
        : icon && <iconify-icon {...part('icon')} icon={icon} aria-hidden="true" />}
      {children}
    </span>
  )
}
