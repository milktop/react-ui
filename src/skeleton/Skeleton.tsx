/**
 * A placeholder shape while content loads.
 *
 *   <Skeleton circle width="2.5rem" height="2.5rem" />
 *   <Skeleton lines={3} />
 *
 * - `lines`: that many text-like lines (the last one shorter)
 * - `circle`: a circle, e.g. for an avatar
 * - `width`, `height`: any CSS length (defaults fit a line of text)
 *
 * It is hidden from assistive tech; announce loading elsewhere (aria-busy on
 * the region, or a Spinner's label).
 */
import type { ComponentProps } from 'react'
import { cx, partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './skeleton.css'

export type SkeletonProps = ComponentProps<'div'> & {
  lines?: number
  circle?: boolean
  width?: string | null
  height?: string | null
  classes?: Classes<'root' | 'line'>
}

export function Skeleton({ lines = 0, circle = false, width = null, height = null, className, classes, style, ...rest }: SkeletonProps) {
  const part = partsOf('skeleton', classes)
  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} aria-hidden="true"
      data-circle={circle || undefined} data-text={lines > 0 || undefined}
      style={{ ...(width && { width }), ...(height && { height }), ...style }}>
      {Array.from({ length: lines }, (_, i) => <span key={i} {...part('line')} data-last={(i === lines - 1 && lines > 1) || undefined} />)}
    </div>
  )
}
