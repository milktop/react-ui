/**
 * A line between things: across (between sections) or up (between toolbar
 * buttons), with an optional label in the middle ('or', 'Today').
 *
 *   <Divider />
 *   <Divider label="or" />
 *   <Divider orientation="vertical" />
 *
 * - `label`: text (or anything) in the line; `align`: 'center' (default),
 *   'start' or 'end'
 * - `orientation`: 'horizontal' (default) or 'vertical' (as tall as its row)
 * - `variant`: 'solid' (default), 'dashed' or 'dotted'
 * - `spacing`: the room either side, a CSS length (0.75rem across, 0.5rem up)
 */
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cx, partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './divider.css'

export type DividerProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode
  align?: 'start' | 'center' | 'end'
  orientation?: 'horizontal' | 'vertical'
  variant?: 'solid' | 'dashed' | 'dotted'
  spacing?: string | null
  classes?: Classes<'root' | 'label'>
}

export function Divider({
  label = null, align = 'center', orientation = 'horizontal', variant = 'solid', spacing = null, className, classes, style, ...rest
}: DividerProps) {
  const part = partsOf('divider', classes)
  return (
    // A labelled line is a separator with a name; a plain one only a separator.
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} role="separator" aria-orientation={orientation}
      data-orientation={orientation} data-variant={variant} data-align={align} data-labelled={label ? '' : undefined}
      style={{ ...style, ...(spacing && { '--spacing': spacing }) } as CSSProperties}>
      {label && <span {...part('label')}>{label}</span>}
    </div>
  )
}
