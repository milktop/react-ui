/**
 * A spinner, for short waits.
 *
 *   <Spinner size="sm" />
 *
 * - `label`: announced to assistive tech ('Loading')
 * - `size`: 'sm', 'md' (default) or 'lg'
 */
import type { ComponentProps } from 'react'
import { cx, partsOf, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './spinner.css'

export type SpinnerProps = ComponentProps<'span'> & {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  classes?: Classes<'root'>
}

export function Spinner({ label: labelProp, size = 'md', className, classes, ...rest }: SpinnerProps) {
  const t = useMessages()
  const label = labelProp ?? t.common.loading
  const part = partsOf('spinner', classes)
  return <span {...rest} {...part('root')} className={cx(className, classes?.root)} data-size={size} role="status" aria-label={label} />
}
