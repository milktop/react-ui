/**
 * Styles rich text: headings, lists, quotes, links, code, images and tables,
 * e.g. the HTML an Editor saved, shown on a page.
 *
 *   <Prose html={lesson.notes} />
 *   <Prose size="sm"><h2>Homework</h2><p>Worksheet 4…</p></Prose>
 *
 * Its look matches the Editor's, so what was written reads the same.
 *
 * - `html`: an HTML string to show (only from a source you trust, such as
 *   your own Editor's output saved by your app); or give it children
 * - `size`: 'sm' (13px), 'md' (14px, default) or 'lg' (16px)
 */
import type { HTMLAttributes } from 'react'
import { cx, partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './prose.css'

export type ProseProps = HTMLAttributes<HTMLDivElement> & {
  html?: string | null
  size?: 'sm' | 'md' | 'lg'
  classes?: Classes<'root'>
}

export function Prose({ html = null, size = 'md', className, classes, children, ...rest }: ProseProps) {
  const part = partsOf('prose', classes)
  return html != null
    ? <div {...rest} {...part('root')} className={cx(className, classes?.root)} data-size={size} dangerouslySetInnerHTML={{ __html: html }} />
    : <div {...rest} {...part('root')} className={cx(className, classes?.root)} data-size={size}>{children}</div>
}
