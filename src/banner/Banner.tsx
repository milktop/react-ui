/**
 * A slim, prominent strip for an announcement or a page-wide message, e.g.
 * across the top of the content. For a message within the content, use Alert.
 *
 *   <Banner icon="lucide:sparkles" dismissible>
 *     Notes can now be shared with parents. <a href="/help/notes">See how</a>
 *   </Banner>
 *
 * - `variant`: 'accent' (default, solid), 'soft', 'neutral', 'success', 'warning' or 'danger'
 * - `icon`: an Iconify name before the message
 * - `actions`: buttons or links at the end
 * - `dismissible`: a close button, which hides it and calls `onDismiss`
 * - `open`, `defaultOpen`: whether it shows (true); `onOpenChange`
 * - `full`: no rounding, to run edge to edge
 */
import type { HTMLAttributes, ReactNode } from 'react'
import '../icons.js'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './banner.css'

export type BannerProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'accent' | 'soft' | 'neutral' | 'success' | 'warning' | 'danger'
  icon?: string | null
  actions?: ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  full?: boolean
  classes?: Classes<'root' | 'icon' | 'description' | 'actions' | 'close'>
}

export function Banner({
  variant = 'accent', icon = null, actions = null, dismissible = false, onDismiss, open: openProp, defaultOpen = true, onOpenChange,
  full = false, className, classes, children, ...rest
}: BannerProps) {
  const t = useMessages()
  const part = partsOf('banner', classes)
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  if (!open) return null

  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} data-variant={variant} data-full={full || undefined} role="status">
      {icon && <iconify-icon {...part('icon')} icon={icon} aria-hidden="true" />}
      <div {...part('description')}>{children}</div>
      {actions && <div {...part('actions')}>{actions}</div>}
      {dismissible && (
        <button {...part('close')} type="button" aria-label={t.common.dismiss} onClick={() => { setOpen(false); onDismiss?.() }}>
          <iconify-icon icon="lucide:x" />
        </button>
      )}
    </div>
  )
}
