/**
 * A tooltip: a short hint on hover and keyboard focus.
 *
 *   <Tooltip content="Archive"><Button icon="lucide:archive" aria-label="Archive" /></Tooltip>
 *   <Tooltip content="Ada Lovelace">Ada</Tooltip>
 *
 * - children: the element it describes, which gets the trigger's props (a
 *   component must pass them and its ref on, as Button does); text, several
 *   elements or a disabled one (which fires no events) are wrapped in a span
 *   that takes them
 * - `content`: what it says (text or markup)
 * - `placement`: 'top' (default), 'bottom-start', …
 * - `openDelay` (0), `closeDelay` in ms; `interactive`: stays open while the
 *   pointer is over it; `disabled`
 * - `open`, `defaultOpen`; `onOpenChange`: called with the new open state
 *
 * It closes on Escape, click or scroll. With `interactive` it stays open while
 * the pointer is over it, so its text can be selected.
 *
 * By hand, with Ark's parts:
 *
 *   <Tooltip.Root>
 *     <Tooltip.Trigger asChild><Button>Save</Button></Tooltip.Trigger>
 *     <Tooltip.Positioner><Tooltip.Content><Tooltip.Arrow><Tooltip.ArrowTip /></Tooltip.Arrow>Saves a draft</Tooltip.Content></Tooltip.Positioner>
 *   </Tooltip.Root>
 */
import { isValidElement, type ReactNode } from 'react'
import { Tooltip as Ark, type TooltipOpenChangeDetails } from '@ark-ui/react/tooltip'
import { Portal } from '@ark-ui/react/portal'
import { cx, on, partsOf, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './tooltip.css'

export type TooltipProps = Omit<Ark.ContentProps, 'content' | 'children'> & {
  content?: ReactNode
  placement?: NonNullable<Ark.RootProps['positioning']>['placement']
  openDelay?: number
  closeDelay?: number
  interactive?: boolean
  disabled?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean, details: TooltipOpenChangeDetails) => void
  children?: ReactNode
  classes?: Classes<'trigger' | 'positioner' | 'content' | 'arrow' | 'arrowTip'>
}

function TooltipShortcut({
  content = null, placement = 'top', openDelay = 0, closeDelay, interactive = false, disabled = false,
  open, defaultOpen, onOpenChange, className, classes, children, ...rest
}: TooltipProps) {
  const part = partsOf('tooltip', classes)

  return (
    <Ark.Root openDelay={openDelay} interactive={interactive} disabled={disabled} lazyMount unmountOnExit
      positioning={{ placement, strategy: 'fixed', gutter: 8 }}
      {...(closeDelay !== undefined && { closeDelay })} {...(open !== undefined && { open })}
      {...(defaultOpen !== undefined && { defaultOpen })}
      {...on('onOpenChange', onOpenChange, (details: TooltipOpenChangeDetails) => details.open)}>
      {isValidElement<{ disabled?: boolean }>(children) && !children.props.disabled
        ? <Ark.Trigger asChild>{children}</Ark.Trigger>
        : <Ark.Trigger asChild><span {...part('trigger')}>{children}</span></Ark.Trigger>}
      <Portal>
        <Ark.Positioner {...part('positioner')}>
          <Ark.Content {...rest} {...part('content')} className={cx(className, classes?.content)}>
            <Ark.Arrow {...part('arrow')}><Ark.ArrowTip {...part('arrow-tip')} /></Ark.Arrow>
            {content}
          </Ark.Content>
        </Ark.Positioner>
      </Portal>
    </Ark.Root>
  )
}

export const Tooltip = withParts(TooltipShortcut, {
  Root: Ark.Root,
  Trigger: Ark.Trigger,
  Positioner: Ark.Positioner,
  Content: Ark.Content,
  Arrow: Ark.Arrow,
  ArrowTip: Ark.ArrowTip,
  Context: Ark.Context,
})
