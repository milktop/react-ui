/**
 * A button. Other attributes (onClick, aria-label, form…) go on the <button>.
 *
 *   <Button variant="primary" icon="lucide:save" loading={saving}>Save</Button>
 *
 * - `variant`: 'default', 'primary', 'danger', 'soft', 'ghost' or 'link'
 * - `size`: 'sm', 'md' (matching the inputs' height) or 'lg'
 * - `icon`, `iconEnd`: Iconify names; with no text it is an icon button, so give it an aria-label
 * - `loading`: a spinner in place of the icon; also disables it
 * - `round`: a circle for icon buttons, a pill with text
 * - `block`: full width
 * - `count`: a badge on the corner (hidden at 0 or null), "99+" past `max`
 * - `dot`: a small dot there instead, for "something new"
 * - `pulse`: a ring ripples out from the badge or dot (not when the system asks for less motion)
 * - `countColor`: 'danger', 'accent', 'success', 'warning' or 'neutral'
 * - `countLabel`: what the count is, for assistive tech ('new': "Inbox, 3 new")
 * - `type`: 'button' by default (pass 'submit' for forms)
 */
import type { ComponentProps } from 'react'
import 'iconify-icon'
import { cx, partsOf, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './button.css'

export type ButtonProps = ComponentProps<'button'> & {
  variant?: 'default' | 'primary' | 'danger' | 'soft' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  icon?: string | null
  iconEnd?: string | null
  loading?: boolean
  round?: boolean
  block?: boolean
  count?: number | null
  max?: number
  dot?: boolean
  pulse?: boolean
  countColor?: 'danger' | 'accent' | 'success' | 'warning' | 'neutral'
  countLabel?: string
  classes?: Classes<'root' | 'spinner' | 'icon' | 'badge' | 'spoken'>
}

export function Button({
  variant = 'default', size = 'md', icon = null, iconEnd = null, loading = false,
  round = false, block = false, count = null, max = 99, dot = false, pulse = false, countColor = 'danger', countLabel: countLabelProp,
  type = 'button', disabled = false,
  className, classes, children, ...rest
}: ButtonProps) {
  const t = useMessages()
  const countLabel = countLabelProp ?? t.button.countLabel
  const part = partsOf('button', classes)
  const badge = count && count > 0 ? (count > max ? `${max}+` : String(count)) : dot ? '' : null
  // Read after the label by assistive tech: "Inbox, 3 new".
  const spoken = count && count > 0 ? `${count} ${countLabel}` : dot ? countLabel : ''
  // An aria-label hides the button's text from assistive tech, so the count joins the label.
  const label = rest['aria-label'] && spoken ? `${rest['aria-label']}, ${spoken}` : rest['aria-label']

  return (
    <button {...rest} {...part('root')} className={cx(className, classes?.root)} type={type} disabled={disabled || loading}
      aria-label={label} aria-busy={loading || undefined}
      data-variant={variant} data-size={size} data-round={round || undefined} data-block={block || undefined}
      data-loading={loading || undefined} data-icon-only={(children == null && !(icon && iconEnd)) || undefined}>
      {loading
        ? <span {...part('spinner')} aria-hidden="true" />
        : icon && <iconify-icon {...part('icon')} icon={icon} aria-hidden="true" />}
      {children}
      {iconEnd && <iconify-icon {...part('icon')} icon={iconEnd} aria-hidden="true" />}
      {badge != null && <>
        <span {...part('badge')} aria-hidden="true" data-dot={badge === '' || undefined} data-pulse={pulse || undefined} data-color={countColor}>{badge}</span>
        {!rest['aria-label'] && <span {...part('spoken')}>, {spoken}</span>}
      </>}
    </button>
  )
}
