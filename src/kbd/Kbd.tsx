/**
 * A keyboard key, or a shortcut of several.
 *
 *   <Kbd>Esc</Kbd>
 *   <Kbd keys={['⌘', 'K']} />
 *
 * - `keys`: several keys, each in its own box (the content, if given, is one key)
 * - `size`: 'sm' or 'md'
 */
import { Fragment, type HTMLAttributes } from 'react'
import { cx, partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './kbd.css'

export type KbdProps = HTMLAttributes<HTMLElement> & {
  keys?: string[] | null
  size?: 'sm' | 'md'
  classes?: Classes<'root' | 'key'>
}

export function Kbd({ keys = null, size = 'md', className, classes, children, ...rest }: KbdProps) {
  const part = partsOf('kbd', classes)
  if (!keys) return <kbd {...rest} {...part('key')} className={cx(className, classes?.key)} data-size={size}>{children}</kbd>
  return (
    <span {...rest} {...part('root')} className={cx(className, classes?.root)} data-size={size}>
      {keys.map((key, i) => <Fragment key={i}><kbd {...part('key')} data-size={size}>{key}</kbd></Fragment>)}
    </span>
  )
}
