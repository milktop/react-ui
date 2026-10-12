/**
 * Text with the parts matching a search marked, e.g. in search results.
 *
 *   <Highlight text={student.name} query={search} />
 *   <Highlight text={note} query={search} color="yellow" />
 *
 * - `text`: the text; `query`: what to mark (a string, or several)
 * - `ignoreCase` (true), `matchAll` (true: every match, not just the first)
 * - `color`: the marks' background: 'accent' (default, the `--ui-highlight`
 *   token), 'yellow', 'amber', 'orange', 'red', 'green', 'teal', 'blue',
 *   'purple', 'pink' or 'gray' (tints that keep the text readable, deeper in
 *   dark mode), or any CSS colour, used as it is. For every highlight in the
 *   app, set `--ui-highlight` on :root instead.
 */
import type { CSSProperties } from 'react'
import { Highlight as Ark, type HighlightProps as ArkProps } from '@ark-ui/react/highlight'
import { partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './highlight.css'

export type HighlightColor = 'accent' | 'yellow' | 'amber' | 'orange' | 'red' | 'green' | 'teal' | 'blue' | 'purple' | 'pink' | 'gray'

const named = ['yellow', 'amber', 'orange', 'red', 'green', 'teal', 'blue', 'purple', 'pink', 'gray']

export type HighlightProps = Omit<ArkProps, 'query' | 'color'> & {
  query: string | string[]
  color?: HighlightColor | (string & {})
  classes?: Classes<'mark'>
}

export function Highlight({ text, query, ignoreCase = true, matchAll = true, color = 'accent', className, classes, style, ...rest }: HighlightProps) {
  const part = partsOf('highlight', classes)
  // Ark marks the matches with <mark>; an empty query marks nothing.
  const queries = ([] as string[]).concat(query).filter((q) => q.trim())
  // A named colour is a data attribute; any other (not 'accent') sets the token on the marks.
  const custom = color !== 'accent' && !named.includes(color)
  return <Ark {...rest} text={text} query={queries} ignoreCase={ignoreCase} matchAll={matchAll} {...part('mark')} className={className ?? classes?.mark}
    data-color={named.includes(color) ? color : undefined}
    style={custom ? { ...style, '--ui-highlight': color } as CSSProperties : style} />
}
