/**
 * Avatars in an overlapping stack, each ringed in the page colour, with a
 * "+3" for the rest.
 *
 *   <AvatarGroup items={students} max={4} tooltip />
 *   <AvatarGroup size="sm"><Avatar name="Ada Lovelace" /><Avatar name="Alan Turing" /></AvatarGroup>
 *
 * - `items`: `{ name, src, color }` (or names), shown as Avatars; or put
 *   Avatars in it yourself
 * - `max`: with `items`, show this many and a "+N" for the rest (its tooltip
 *   lists them)
 * - `size`, `color`, `square`, `letters`: passed to each Avatar
 * - `tooltip`: each name in a tooltip on hover
 * - `spacing`: 'tight', 'normal' (default) or 'loose', how much they overlap
 * - `label`: what the group is, for assistive tech ('3 students')
 * - the ring is `--ui-avatar-ring` (the surface by default): set it to the
 *   background the group sits on
 */
import type { CSSProperties, HTMLAttributes } from 'react'
import { Tooltip } from '../tooltip/Tooltip.js'
import { Avatar, customSize, type AvatarColor, type AvatarSize } from './Avatar.js'
import { cx, partsOf, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './avatar.css'

export type AvatarPerson = { name?: string | null, src?: string | null, color?: AvatarColor | 'auto' }

export type AvatarGroupProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'> & {
  items?: (AvatarPerson | string)[] | null
  max?: number | null
  size?: AvatarSize
  color?: AvatarColor | 'auto'
  square?: boolean
  letters?: 1 | 2
  tooltip?: boolean
  spacing?: 'tight' | 'normal' | 'loose'
  label?: string | null
  classes?: Classes<'root' | 'more'>
}

export function AvatarGroup({
  items = null, max = null, size = 'md', color = 'accent', square = false, letters = 2, tooltip = false,
  spacing = 'normal', label = null, className, classes, children, ...rest
}: AvatarGroupProps) {
  const t = useMessages()
  const part = partsOf('avatar-group', classes)
  const people = (items ?? []).map((item) => (typeof item === 'string' ? { name: item } : item))
  const shown = max && people.length > max ? people.slice(0, max) : people
  const hidden = people.slice(shown.length)
  const custom = customSize(size)
  const names = hidden.map((person) => person.name).join(', ')

  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} role="group"
      aria-label={label ?? (items ? `${people.length} people` : undefined)} data-size={custom ? 'custom' : size} data-spacing={spacing}>
      {shown.map((person, i) => (
        <Avatar key={person.name ?? person.src ?? i} size={size} square={square} letters={letters} color={person.color ?? color}
          name={person.name} src={person.src} tooltip={tooltip || null} />
      ))}
      {children}
      {hidden.length > 0 && (
        <Tooltip content={names}>
          <span {...part('more')} data-square={square || undefined} aria-label={`${t.common.more(hidden.length)}: ${names}`}
            style={custom ? { '--avatar-size': custom } as CSSProperties : undefined}>+{hidden.length}</span>
        </Tooltip>
      )}
    </div>
  )
}
