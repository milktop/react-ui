/**
 * A popover: a panel that opens from a trigger, for settings or details.
 *
 *   <Popover heading="Appearance" closable placement="bottom-end"
 *     trigger={<Button icon="lucide:palette" aria-label="Appearance" />}>
 *     …content…
 *   </Popover>
 *
 * - `trigger`: the element that opens it (it gets the trigger's props, so a
 *   component must pass them on, as Button does)
 * - `heading`, `description`: a header for the panel
 * - `closable`: a close button in the corner
 * - `arrow`: points the panel at its trigger
 * - `modal`: traps focus and blocks the page behind it
 * - `open`, `defaultOpen`; `onOpenChange`
 * - `placement`: where it opens ('bottom')
 *
 * By hand, with Ark's parts:
 *
 *   <Popover.Root>
 *     <Popover.Trigger asChild><Button>Filters</Button></Popover.Trigger>
 *     <Popover.Positioner>
 *       <Popover.Content><Popover.Title>Filters</Popover.Title>…<Popover.CloseTrigger>×</Popover.CloseTrigger></Popover.Content>
 *     </Popover.Positioner>
 *   </Popover.Root>
 */
import type { ReactElement, ReactNode } from 'react'
import { Popover as Ark, type PopoverOpenChangeDetails } from '@ark-ui/react/popover'
import 'iconify-icon'
import { cx, on, partOf, partsOf, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './popover.css'

export type PopoverProps = Omit<Ark.ContentProps, 'children'> & {
  trigger?: ReactElement | null
  heading?: ReactNode
  description?: ReactNode
  closable?: boolean
  arrow?: boolean
  modal?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void
  placement?: NonNullable<Ark.RootProps['positioning']>['placement']
  classes?: Classes<'positioner' | 'content' | 'arrow' | 'arrowTip' | 'header' | 'title' | 'description' | 'closeTrigger'>
  children?: ReactNode
}

function PopoverShortcut({
  trigger = null, heading = null, description = null, closable = false, arrow = false, modal = false,
  open, defaultOpen, onOpenChange, placement = 'bottom', className, classes, children, ...rest
}: PopoverProps) {
  const part = partsOf('popover', classes)
  return (
    // Mounted (hidden) from the start, as in svelte-ui; fixed, so a scrolling
    // or clipped parent can't cut it off.
    <Ark.Root modal={modal} positioning={{ placement, strategy: 'fixed' }}
      {...(open !== undefined && { open })} {...(defaultOpen !== undefined && { defaultOpen })}
      {...on('onOpenChange', onOpenChange, (details: PopoverOpenChangeDetails) => details.open)}>
      {trigger && <Ark.Trigger asChild>{trigger}</Ark.Trigger>}
      <Ark.Positioner {...part('positioner')}>
        <Ark.Content {...rest} {...part('content')} className={cx(className, classes?.content)}>
          {arrow && <Ark.Arrow {...part('arrow')}><Ark.ArrowTip {...part('arrow-tip')} /></Ark.Arrow>}
          {(heading || description) && (
            <div {...part('header')}>
              {heading && <Ark.Title {...part('title')}>{heading}</Ark.Title>}
              {description && <Ark.Description {...part('description')}>{description}</Ark.Description>}
            </div>
          )}
          {children}
          {closable && <Ark.CloseTrigger {...part('close-trigger')} aria-label="Close"><iconify-icon icon="lucide:x" /></Ark.CloseTrigger>}
        </Ark.Content>
      </Ark.Positioner>
    </Ark.Root>
  )
}

export const Popover = withParts(PopoverShortcut, {
  Root: Ark.Root,
  Trigger: Ark.Trigger,
  Anchor: Ark.Anchor,
  Positioner: Ark.Positioner,
  Content: Ark.Content,
  Title: Ark.Title,
  Description: Ark.Description,
  CloseTrigger: Ark.CloseTrigger,
  Arrow: Ark.Arrow,
  ArrowTip: Ark.ArrowTip,
  Context: Ark.Context,
  Header: partOf('popover', 'header'),
})
