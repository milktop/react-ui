/**
 * A richer preview that opens while the pointer rests on (or keyboard focus
 * is on) a trigger, e.g. a person's details over their name.
 *
 *   <HoverCard trigger={<a href="/students/1">Ada Lovelace</a>}>…card content…</HoverCard>
 *
 * It stays open while the pointer is over the card, so its content can be
 * selected or clicked. Keep anything essential reachable another way (touch
 * has no hover).
 *
 * - `trigger`: your link or button (it gets the trigger's props)
 * - `placement`: 'bottom' (default), 'top', 'right-start', …
 * - `openDelay`, `closeDelay`: in ms (400 and 200)
 * - `arrow`: points the card at its trigger; `disabled`
 * - `open`, `defaultOpen`; `onOpenChange`
 *
 * By hand: HoverCard.Root, Trigger, Positioner, Content, Arrow, ArrowTip.
 */
import type { ReactElement, ReactNode } from 'react'
import { HoverCard as Ark, type HoverCardOpenChangeDetails } from '@ark-ui/react/hover-card'
import { cx, on, partsOf, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './hover-card.css'

export type HoverCardProps = Omit<Ark.ContentProps, 'children'> & {
  trigger?: ReactElement | null
  placement?: NonNullable<Ark.RootProps['positioning']>['placement']
  openDelay?: number
  closeDelay?: number
  arrow?: boolean
  disabled?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean, details: HoverCardOpenChangeDetails) => void
  classes?: Classes<'positioner' | 'content' | 'arrow' | 'arrowTip'>
  children?: ReactNode
}

function HoverCardShortcut({
  trigger = null, placement = 'bottom', openDelay = 400, closeDelay = 200, arrow = false, disabled = false,
  open, defaultOpen, onOpenChange, className, classes, children, ...rest
}: HoverCardProps) {
  const part = partsOf('hover-card', classes)
  return (
    <Ark.Root openDelay={openDelay} closeDelay={closeDelay} disabled={disabled} lazyMount unmountOnExit
      positioning={{ placement, strategy: 'fixed', gutter: 8 }}
      {...(open !== undefined && { open })} {...(defaultOpen !== undefined && { defaultOpen })}
      {...on('onOpenChange', onOpenChange, (details: HoverCardOpenChangeDetails) => details.open)}>
      {trigger && <Ark.Trigger asChild>{trigger}</Ark.Trigger>}
      <Ark.Positioner {...part('positioner')}>
        <Ark.Content {...rest} {...part('content')} className={cx(className, classes?.content)}>
          {arrow && <Ark.Arrow {...part('arrow')}><Ark.ArrowTip {...part('arrow-tip')} /></Ark.Arrow>}
          {children}
        </Ark.Content>
      </Ark.Positioner>
    </Ark.Root>
  )
}

export const HoverCard = withParts(HoverCardShortcut, {
  Root: Ark.Root,
  Trigger: Ark.Trigger,
  Positioner: Ark.Positioner,
  Content: Ark.Content,
  Arrow: Ark.Arrow,
  ArrowTip: Ark.ArrowTip,
  Context: Ark.Context,
})
