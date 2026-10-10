/**
 * A responsive grid of stats: one column, then two, then `columns`, as its
 * own width (not the screen's) allows.
 *
 *   <Stats variant="cards">
 *     <Stat label="Students" value={24} />
 *     <Stat label="Lessons" value={52} />
 *   </Stats>
 *
 * - `columns`: the most per row (4)
 * - `variant`: 'plain' (default), 'cards' (each stat a card) or 'divided'
 *   (one card split into cells)
 */
import type { CSSProperties, HTMLAttributes } from 'react'
import { cx, partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './stat.css'

export type StatsProps = HTMLAttributes<HTMLDivElement> & {
  columns?: number
  variant?: 'plain' | 'cards' | 'divided'
  classes?: Classes<'root' | 'grid'>
}

export function Stats({ columns = 4, variant = 'plain', className, classes, style, children, ...rest }: StatsProps) {
  const part = partsOf('stats', classes)
  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} data-variant={variant}
      style={{ ...style, '--columns': columns } as CSSProperties}>
      <div {...part('grid')}>{children}</div>
    </div>
  )
}
