/**
 * A panel that slides in from an edge of the screen, for viewing or editing
 * something without leaving the page.
 *
 *   <Sheet heading="Edit student" open={editing} onOpenChange={setEditing}
 *     footer={<Button variant="primary">Save</Button>}>
 *     …body…
 *   </Sheet>
 *
 * A modal dialog underneath: focus is trapped, the page behind doesn't
 * scroll, Escape or the backdrop closes it, and focus returns to the trigger.
 *
 * - `side`: 'right' (default), 'left', 'top' or 'bottom'
 * - `size`: 'sm', 'md' (default) or 'lg': the width (or height for top and bottom)
 * - `open`, `defaultOpen`, `onOpenChange`, `trigger`, `heading`, `description`,
 *   `footer`, `closable`, `alert`: as for Dialog
 *
 * Or composed from Sheet.Header (heading, description), Sheet.Body and
 * Sheet.Footer, with a Sheet.Trigger child, as Dialog is. By hand, Dialog's
 * Ark parts work too: give them data-scope="sheet" (Sheet.Content and the
 * rest here do that for you).
 */
import { Children, isValidElement, type ComponentProps, type ComponentType, type ReactElement, type ReactNode } from 'react'
import { Dialog as Ark, type DialogOpenChangeDetails } from '@ark-ui/react/dialog'
import { Portal } from '@ark-ui/react/portal'
import 'iconify-icon'
import { cx, on, partOf, partsOf, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './sheet.css'

export type SheetProps = Omit<Ark.ContentProps, 'children'> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void
  side?: 'right' | 'left' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg'
  heading?: ReactNode
  description?: ReactNode
  alert?: boolean
  closable?: boolean
  trigger?: ReactElement | null
  footer?: ReactNode
  classes?: Classes<'backdrop' | 'positioner' | 'content' | 'closeTrigger' | 'header' | 'title' | 'description' | 'body' | 'footer'>
  children?: ReactNode
}

// Ark's dialog stamps data-scope="dialog"; ours wins, so Dialog's CSS stays off.
const scoped = (name: string) => ({ 'data-scope': 'sheet', 'data-part': name })

type HeaderProps = ComponentProps<'div'> & { heading?: ReactNode, description?: ReactNode }
function Header({ heading = null, description = null, children, ...rest }: HeaderProps) {
  return (
    <div {...scoped('header')} {...rest}>
      {heading && <Ark.Title {...scoped('title')}>{heading}</Ark.Title>}
      {description && <Ark.Description {...scoped('description')}>{description}</Ark.Description>}
      {children}
    </div>
  )
}
const Body = partOf('sheet', 'body')
const Footer = partOf('sheet', 'footer')
const layout = [Header, Body, Footer] as unknown[]

// Ark's parts under the sheet scope, for building one by hand.
const withScope = <P extends object>(Part: ComponentType<P>, name: string) => {
  const Scoped = (props: P) => <Part {...props} {...scoped(name)} />
  Scoped.displayName = `Sheet.${name}`
  return Scoped
}

function SheetShortcut({
  open, defaultOpen, onOpenChange, side = 'right', size = 'md', heading = null, description = null, alert = false,
  closable = true, trigger = null, footer = null, className, classes, children, ...rest
}: SheetProps) {
  const part = partsOf('sheet', classes)
  const nodes = Children.toArray(children)
  const composed = nodes.some((node) => isValidElement(node) && layout.includes(node.type))
  const triggers = nodes.filter((node) => isValidElement(node) && node.type === Ark.Trigger)
  const content = composed ? nodes.filter((node) => !triggers.includes(node)) : children

  return (
    <Ark.Root {...(open !== undefined && { open })} {...(defaultOpen !== undefined && { defaultOpen })}
      {...on('onOpenChange', onOpenChange, (details: DialogOpenChangeDetails) => details.open)}
      role={alert ? 'alertdialog' : 'dialog'} closeOnInteractOutside={!alert} lazyMount unmountOnExit>
      {trigger && <Ark.Trigger asChild>{trigger}</Ark.Trigger>}
      {composed && triggers}
      <Portal>
        <Ark.Backdrop {...part('backdrop')} />
        <Ark.Positioner {...part('positioner')} data-side={side}>
          <Ark.Content {...rest} {...part('content')} className={cx(className, classes?.content)} data-side={side} data-size={size}>
            {closable && <Ark.CloseTrigger {...part('close-trigger')} aria-label="Close"><iconify-icon icon="lucide:x" /></Ark.CloseTrigger>}
            {composed ? content : <>
              {(heading || description) && (
                <div {...part('header')}>
                  {heading && <Ark.Title {...part('title')}>{heading}</Ark.Title>}
                  {description && <Ark.Description {...part('description')}>{description}</Ark.Description>}
                </div>
              )}
              <div {...part('body')}>{children}</div>
              {footer && <div {...part('footer')}>{footer}</div>}
            </>}
          </Ark.Content>
        </Ark.Positioner>
      </Portal>
    </Ark.Root>
  )
}

export const Sheet = withParts(SheetShortcut, {
  Header, Body, Footer,
  Root: Ark.Root,
  Trigger: Ark.Trigger,
  Backdrop: withScope(Ark.Backdrop, 'backdrop'),
  Positioner: withScope(Ark.Positioner, 'positioner'),
  Content: withScope(Ark.Content, 'content'),
  CloseTrigger: withScope(Ark.CloseTrigger, 'close-trigger'),
  Title: withScope(Ark.Title, 'title'),
  Description: withScope(Ark.Description, 'description'),
  Context: Ark.Context,
})
