/**
 * A modal dialog, rendered at the end of <body> so no ancestor's stacking or
 * overflow can trap it.
 *
 *   <Dialog heading="Delete lesson?" description="This cannot be undone."
 *     trigger={<Button>Delete</Button>}
 *     footer={<Button onClick={…}>Cancel</Button>}>
 *     …body…
 *   </Dialog>
 *
 * Focus moves in and is trapped while it is open, the page behind doesn't
 * scroll, Escape or a click on the backdrop closes it, and focus returns to
 * the trigger.
 *
 * - `open`, `defaultOpen`; `onOpenChange`: called with the new open state;
 *   `onExitComplete`: called once it has animated out
 * - `trigger`: the element that opens it (optional; it gets the trigger's props,
 *   so a component must pass them and its ref on, as Button does)
 * - `heading`, `description`: label and describe it for assistive tech
 * - `footer`: buttons along the bottom
 * - `alert`: an alertdialog, for confirmations; the backdrop doesn't close it
 * - `size`: 'sm', 'md' (default) or 'lg'
 * - `closable`: false hides the close button
 *
 * Or composed, with the overlay still done for you (backdrop, positioning,
 * close button), from Header, Body and Footer; a Dialog.Trigger child opens it:
 *
 *   <Dialog>
 *     <Dialog.Trigger asChild><Button>Edit</Button></Dialog.Trigger>
 *     <Dialog.Header heading="Edit student" description="Saved to their profile." />
 *     <Dialog.Body>…</Dialog.Body>
 *     <Dialog.Footer><Dialog.CloseTrigger asChild><Button>Cancel</Button></Dialog.CloseTrigger>…</Dialog.Footer>
 *   </Dialog>
 *
 * Fully by hand, with Ark's parts (and Header, Body and Footer for the layout):
 *
 *   <Dialog.Root>
 *     <Dialog.Trigger asChild><Button>Open</Button></Dialog.Trigger>
 *     <Portal>
 *       <Dialog.Backdrop />
 *       <Dialog.Positioner>
 *         <Dialog.Content>
 *           <Dialog.Header><Dialog.Title>Title</Dialog.Title></Dialog.Header>
 *           <Dialog.Body>…</Dialog.Body>
 *           <Dialog.Footer><Dialog.CloseTrigger asChild><Button>Close</Button></Dialog.CloseTrigger></Dialog.Footer>
 *         </Dialog.Content>
 *       </Dialog.Positioner>
 *     </Portal>
 *   </Dialog.Root>
 */
import { Children, isValidElement, type ComponentProps, type ReactElement, type ReactNode } from 'react'
import { Dialog as Ark, type DialogOpenChangeDetails } from '@ark-ui/react/dialog'
import { Portal } from '@ark-ui/react/portal'
import '../icons.js'
import { cx, on, partOf, partsOf, withParts, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './dialog.css'

export type DialogProps = Omit<Ark.ContentProps, 'children'> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void
  onExitComplete?: () => void
  heading?: ReactNode
  description?: ReactNode
  alert?: boolean
  size?: 'sm' | 'md' | 'lg'
  closable?: boolean
  trigger?: ReactElement | null
  footer?: ReactNode
  classes?: Classes<'backdrop' | 'positioner' | 'content' | 'closeTrigger' | 'header' | 'title' | 'description' | 'body' | 'footer'>
  children?: ReactNode
}

// Our layout parts. Header can name and describe the dialog itself:
// <Dialog.Header heading="…" description="…" />, wired up as the dialog's
// title and description, like the shortcut's props.
type HeaderProps = ComponentProps<'div'> & { heading?: ReactNode, description?: ReactNode }
function Header({ heading = null, description = null, children, ...rest }: HeaderProps) {
  return (
    <div data-scope="dialog" data-part="header" {...rest}>
      {heading && <Ark.Title>{heading}</Ark.Title>}
      {description && <Ark.Description>{description}</Ark.Description>}
      {children}
    </div>
  )
}
const Body = partOf('dialog', 'body')
const Footer = partOf('dialog', 'footer')
const layout = [Header, Body, Footer] as unknown[]

function DialogShortcut({
  open, defaultOpen, onOpenChange, onExitComplete, heading = null, description = null, alert = false, size = 'md', closable = true,
  trigger = null, footer = null, className, classes, children, ...rest
}: DialogProps) {
  const t = useMessages()
  const part = partsOf('dialog', classes)
  // Composed from Dialog.Header, Body and Footer: they go straight into the
  // dialog (not wrapped as its body), and a Dialog.Trigger goes before it.
  const nodes = Children.toArray(children)
  const composed = nodes.some((node) => isValidElement(node) && layout.includes(node.type))
  const triggers = nodes.filter((node) => isValidElement(node) && node.type === Ark.Trigger)
  const content = composed ? nodes.filter((node) => !triggers.includes(node)) : children
  // Left out when not given: Zag reads undefined as a value.
  const state = { ...(open !== undefined && { open }), ...(defaultOpen !== undefined && { defaultOpen }) }

  return (
    <Ark.Root {...state} {...on('onOpenChange', onOpenChange, (details: DialogOpenChangeDetails) => details.open)}
      {...(onExitComplete && { onExitComplete })}
      role={alert ? 'alertdialog' : 'dialog'} closeOnInteractOutside={!alert} lazyMount unmountOnExit>
      {trigger && <Ark.Trigger asChild>{trigger}</Ark.Trigger>}
      {composed && triggers}
      <Portal>
        <Ark.Backdrop {...part('backdrop')} />
        <Ark.Positioner {...part('positioner')}>
          <Ark.Content {...rest} {...part('content')} className={cx(className, classes?.content)} data-size={size}>
            {closable && <Ark.CloseTrigger {...part('close-trigger')} aria-label={t.common.close}><iconify-icon icon="lucide:x" /></Ark.CloseTrigger>}
            {(heading || description) && (
              <div {...part('header')}>
                {heading && <Ark.Title {...part('title')}>{heading}</Ark.Title>}
                {description && <Ark.Description {...part('description')}>{description}</Ark.Description>}
              </div>
            )}
            {composed ? content : children != null && <div {...part('body')}>{children}</div>}
            {footer && <div {...part('footer')}>{footer}</div>}
          </Ark.Content>
        </Ark.Positioner>
      </Portal>
    </Ark.Root>
  )
}

export const Dialog = withParts(DialogShortcut, {
  Root: Ark.Root,
  Trigger: Ark.Trigger,
  Backdrop: Ark.Backdrop,
  Positioner: Ark.Positioner,
  Content: Ark.Content,
  CloseTrigger: Ark.CloseTrigger,
  Title: Ark.Title,
  Description: Ark.Description,
  Context: Ark.Context,
  Header,
  Body,
  Footer,
})
