/**
 * Text with the parts matching a search marked, e.g. in search results.
 *
 *   <Highlight text={student.name} query={search} />
 *
 * - `text`: the text; `query`: what to mark (a string, or several)
 * - `ignoreCase` (true), `matchAll` (true: every match, not just the first)
 * - the marks' colour is the `--ui-highlight` token (a tint of the accent):
 *   set it on :root for every highlight, or in `style` for one
 */
import { Highlight as Ark, type HighlightProps as ArkProps } from '@ark-ui/react/highlight'
import { partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './highlight.css'

export type HighlightProps = Omit<ArkProps, 'query'> & {
  query: string | string[]
  classes?: Classes<'mark'>
}

export function Highlight({ text, query, ignoreCase = true, matchAll = true, className, classes, ...rest }: HighlightProps) {
  const part = partsOf('highlight', classes)
  // Ark marks the matches with <mark>; an empty query marks nothing.
  const queries = ([] as string[]).concat(query).filter((q) => q.trim())
  return <Ark {...rest} text={text} query={queries} ignoreCase={ignoreCase} matchAll={matchAll} {...part('mark')} className={className ?? classes?.mark} />
}
