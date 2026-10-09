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
 * - `open`, `defaultOpen`; `onOpenChange`: called with the new open state
 * - `trigger`: the element that opens it (optional; it gets the trigger's props,
 *   so a component must pass them and its ref on, as Button does)
 * - `heading`, `description`: label and describe it for assistive tech
 * - `footer`: buttons along the bottom
 * - `alert`: an alertdialog, for confirmations; the backdrop doesn't close it
 * - `size`: 'sm', 'md' (default) or 'lg'
 * - `closable`: false hides the close button
 *
 * By hand, with Ark's parts (and Header, Body and Footer for the layout):
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
import { Dialog as Ark } from '@ark-ui/react/dialog'
import { Portal } from '@ark-ui/react/portal'
import 'iconify-icon'
import { cx, on, partOf, partsOf, withParts } from '../utils.js'
import '../theme.css'
import './dialog.css'

function DialogShortcut({
  open, defaultOpen, onOpenChange, heading = null, description = null, alert = false, size = 'md', closable = true,
  trigger = null, footer = null, className, classes, children, ...rest
}) {
  const part = partsOf('dialog', classes)
  // Left out when not given: Zag reads undefined as a value.
  const state = { ...(open !== undefined && { open }), ...(defaultOpen !== undefined && { defaultOpen }) }

  return (
    <Ark.Root {...state} {...on('onOpenChange', onOpenChange, (details) => details.open)}
      role={alert ? 'alertdialog' : 'dialog'} closeOnInteractOutside={!alert} lazyMount unmountOnExit>
      {trigger && <Ark.Trigger asChild>{trigger}</Ark.Trigger>}
      <Portal>
        <Ark.Backdrop {...part('backdrop')} />
        <Ark.Positioner {...part('positioner')}>
          <Ark.Content {...rest} {...part('content')} className={cx(className, classes?.content)} data-size={size}>
            {closable && <Ark.CloseTrigger {...part('close-trigger')} aria-label="Close"><iconify-icon icon="lucide:x" /></Ark.CloseTrigger>}
            {(heading || description) && (
              <div {...part('header')}>
                {heading && <Ark.Title {...part('title')}>{heading}</Ark.Title>}
                {description && <Ark.Description {...part('description')}>{description}</Ark.Description>}
              </div>
            )}
            {children != null && <div {...part('body')}>{children}</div>}
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
  Header: partOf('dialog', 'header'),
  Body: partOf('dialog', 'body'),
  Footer: partOf('dialog', 'footer'),
})
