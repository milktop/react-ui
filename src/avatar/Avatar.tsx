/**
 * An avatar: an image, or initials while it loads and if it fails.
 *
 *   <Avatar name="Ada Lovelace" src={ada.photo} />
 *   <Avatar name="Ada Lovelace" color="auto" tooltip />
 *
 * - `src`: the image URL
 * - `name`: the alt text and the initials ("Ada Lovelace" → AL); without one
 *   the fallback is a person icon
 * - `letters`: how many initials, 2 (default) or 1
 * - `size`: 'sm', 'md' (default), 'lg' or 'xl', or any CSS length (a number
 *   is pixels); the initials scale with it
 * - `square`: a rounded square instead of a circle
 * - `color`: 'accent' (default), 'gray', 'red', 'orange', 'amber', 'green',
 *   'teal', 'blue', 'purple' or 'pink'; 'auto' picks one from the name, so the
 *   same person always gets the same colour
 * - `status`: a dot on its corner: 'online', 'away', 'busy' or 'offline'
 *   (or any CSS colour); `statusLabel` says it for assistive tech
 * - `tooltip`: true shows the name on hover (handy in a stack), or a string
 *   shows that instead
 *
 * By hand, with Ark's parts:
 *
 *   <Avatar.Root data-size="lg">
 *     <Avatar.Fallback>AL</Avatar.Fallback>
 *     <Avatar.Image src={ada.photo} alt="Ada Lovelace" />
 *   </Avatar.Root>
 */
import type { CSSProperties } from 'react'
import { Avatar as Ark } from '@ark-ui/react/avatar'
import 'iconify-icon'
import { Tooltip } from '../tooltip/Tooltip.js'
import { cx, partsOf, withParts, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './avatar.css'

export type AvatarColor = 'accent' | 'gray' | 'red' | 'orange' | 'amber' | 'green' | 'teal' | 'blue' | 'purple' | 'pink'
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | (string & {}) | number

export type AvatarProps = Omit<Ark.RootProps, 'color'> & {
  src?: string | null
  name?: string | null
  letters?: 1 | 2
  size?: AvatarSize
  square?: boolean
  color?: AvatarColor | 'auto'
  tooltip?: boolean | string | null
  status?: 'online' | 'away' | 'busy' | 'offline' | (string & {}) | null
  statusLabel?: string
  classes?: Classes<'root' | 'image' | 'fallback' | 'person' | 'tooltipTarget' | 'status'>
}

const named = ['sm', 'md', 'lg', 'xl']
// A size that isn't one of the named ones, as a CSS length.
export const customSize = (size: AvatarSize) =>
  typeof size === 'number' ? `${size}px` : named.includes(size) ? undefined : size

export function initialsOf(name: string | null | undefined, letters: 1 | 2 = 2) {
  const words = String(name ?? '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return ''
  if (letters === 1) return words[0][0].toUpperCase()
  return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[words.length - 1][0]).toUpperCase()
}

// FNV-1a, which spreads similar names well.
const autoColors: AvatarColor[] = ['red', 'orange', 'amber', 'green', 'teal', 'blue', 'purple', 'pink']
export function colorOf(name: string | null | undefined): AvatarColor {
  const key = String(name ?? '').trim()
  if (!key) return 'accent'
  let hash = 2166136261
  for (const ch of key) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619) >>> 0
  return autoColors[hash % autoColors.length]
}

function AvatarShortcut({
  src = null, name = null, letters = 2, size = 'md', square = false, color = 'accent', tooltip = null, status = null, statusLabel,
  className, classes, style, ...rest
}: AvatarProps) {
  const t = useMessages()
  const part = partsOf('avatar', classes)
  const custom = customSize(size)
  const initials = initialsOf(name, letters)
  const tip = tooltip === true ? name : tooltip || null

  return (
    <Ark.Root {...rest} {...part('root')} className={cx(className, classes?.root)}
      data-size={custom ? 'custom' : size} data-square={square || undefined} data-has-status={status ? '' : undefined} data-color={color === 'auto' ? colorOf(name) : color}
      style={{ ...style, ...(custom && { '--avatar-size': custom }) } as CSSProperties}>
      {src && <Ark.Image {...part('image')} src={src} alt={name ?? ''} />}
      <Ark.Fallback {...part('fallback')} aria-hidden={name ? undefined : 'true'}>
        {initials || <iconify-icon {...part('person')} icon="lucide:user" />}
      </Ark.Fallback>
      {/* The tooltip's trigger is a layer over the whole avatar. */}
      {tip && <Tooltip content={tip}><span {...part('tooltip-target')} /></Tooltip>}
      {status && (
        <span {...part('status')} data-status={['online', 'away', 'busy', 'offline'].includes(status) ? status : 'custom'}
          role="img" aria-label={statusLabel ?? t.avatar.status[status as keyof typeof t.avatar.status] ?? status}
          style={['online', 'away', 'busy', 'offline'].includes(status) ? undefined : { background: status }} />
      )}
    </Ark.Root>
  )
}

export const Avatar = withParts(AvatarShortcut, {
  Root: Ark.Root, RootProvider: Ark.RootProvider, Image: Ark.Image, Fallback: Ark.Fallback, Context: Ark.Context,
})
