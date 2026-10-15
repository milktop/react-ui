/**
 * A message in the page (not a popup; see Toast for those).
 *
 *   <Alert variant="warning" heading="Payment overdue">Ada's invoice is 5 days late.</Alert>
 *
 * - `variant`: 'info' (default), 'success', 'warning' or 'danger'
 * - `heading`: a bold first line; the content is the message
 * - `icon`: an Iconify name in place of the variant's, or false for none
 * - `onDismiss`: shows a close button that calls it (hide the alert in response)
 * - `actions`: buttons under the message
 *
 * Danger and warning alerts are role=alert, so assistive tech announces them
 * when they appear; the others are role=status.
 */
import type { ComponentProps, ReactNode } from 'react'
import '../icons.js'
import { cx, partsOf, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './alert.css'

export type AlertProps = ComponentProps<'div'> & {
  variant?: 'info' | 'success' | 'warning' | 'danger'
  heading?: ReactNode
  icon?: string | boolean
  onDismiss?: (() => void) | null
  actions?: ReactNode
  classes?: Classes<'root' | 'icon' | 'text' | 'heading' | 'description' | 'actions' | 'close'>
}

const icons = { info: 'lucide:info', success: 'lucide:circle-check', warning: 'lucide:triangle-alert', danger: 'lucide:circle-alert' }

export function Alert({
  variant = 'info', heading = null, icon = true, onDismiss = null, actions = null, className, classes, children, ...rest
}: AlertProps) {
  const t = useMessages()
  const part = partsOf('alert', classes)
  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} data-variant={variant}
      role={variant === 'danger' || variant === 'warning' ? 'alert' : 'status'}>
      {icon && <iconify-icon {...part('icon')} icon={icon === true ? icons[variant] ?? icons.info : icon} aria-hidden="true" />}
      <div {...part('text')}>
        {heading && <div {...part('heading')}>{heading}</div>}
        {children != null && <div {...part('description')}>{children}</div>}
        {actions && <div {...part('actions')}>{actions}</div>}
      </div>
      {onDismiss && (
        <button {...part('close')} type="button" aria-label={t.common.dismiss} onClick={onDismiss}><iconify-icon icon="lucide:x" /></button>
      )}
    </div>
  )
}
