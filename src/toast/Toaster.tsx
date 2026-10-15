/**
 * The region toasts stack in, rendered at the end of <body>. Put one in the
 * app layout, then call `toaster` from anywhere:
 *
 *   <Toaster />
 *   toaster.success({ title: 'Lesson booked', description: 'Thursday at 16:00' })
 *   toaster.error({ title: 'Could not save' })
 *   const id = toaster.create({ type: 'loading', title: 'Uploading…' })
 *   toaster.update(id, { type: 'success', title: 'Uploaded' })
 *
 * Toasts pause while hovered or focused, Escape dismisses the focused one, and
 * Alt+T jumps to them. An `action: { label, onClick }` adds a button.
 *
 * - `store`: a toaster from createToaster (the shared `toaster` by default)
 * - `label`: the region's accessible name ('Notifications')
 * - `render`: draws each toast yourself, given its data (inside Toast.Root,
 *   with Toast.Title, Description, ActionTrigger, CloseTrigger)
 */
import type { ReactNode } from 'react'
import { Toaster as ArkToaster, Toast, createToaster, type CreateToasterReturn, type ToastOptions } from '@ark-ui/react/toast'
import { Portal } from '@ark-ui/react/portal'
import '../icons.js'
import { cx, partsOf, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './toast.css'

// Toasts: brief notifications stacked in a corner. The shared `toaster`
// stacks at bottom-end; make another with createToaster and pass it to a
// Toaster as `store`.
const make = (options: Partial<Parameters<typeof createToaster>[0]> = {}) =>
  createToaster({ placement: 'bottom-end', overlap: true, max: 5, ...options })
export { make as createToaster }
export const toaster: CreateToasterReturn = make()

export type ToasterProps = {
  store?: CreateToasterReturn
  label?: string
  render?: (toast: ToastOptions) => ReactNode
  className?: string
  classes?: Classes<'group' | 'root' | 'icon' | 'spinner' | 'text' | 'title' | 'description' | 'actionTrigger' | 'closeTrigger'>
}

const icons: Record<string, string> = {
  info: 'lucide:info', success: 'lucide:circle-check', warning: 'lucide:triangle-alert', error: 'lucide:circle-alert',
}

export function Toaster({ store = toaster, label: labelProp, render, className, classes }: ToasterProps) {
  const t = useMessages()
  const label = labelProp ?? t.toaster.label
  const part = partsOf('toast', classes)
  return (
    <Portal>
      <ArkToaster toaster={store} label={label} {...part('group')} className={cx(className, classes?.group)}>
        {(toast) => render ? <Toast.Root {...part('root')}>{render(toast)}</Toast.Root> : (
          <Toast.Root {...part('root')}>
            {toast.type === 'loading' ? <span {...part('spinner')} aria-hidden="true" />
              : toast.type && icons[toast.type] && <iconify-icon {...part('icon')} icon={icons[toast.type]} aria-hidden="true" />}
            <div {...part('text')}>
              {toast.title && <Toast.Title {...part('title')}>{toast.title}</Toast.Title>}
              {toast.description && <Toast.Description {...part('description')}>{toast.description}</Toast.Description>}
            </div>
            {/* Zag calls action.onClick and dismisses the toast. */}
            {toast.action && <Toast.ActionTrigger {...part('action-trigger')}>{toast.action.label}</Toast.ActionTrigger>}
            <Toast.CloseTrigger {...part('close-trigger')} aria-label={t.common.dismiss}><iconify-icon icon="lucide:x" /></Toast.CloseTrigger>
          </Toast.Root>
        )}
      </ArkToaster>
    </Portal>
  )
}

export { Toast }
