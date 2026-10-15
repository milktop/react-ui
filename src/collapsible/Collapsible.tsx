/**
 * A section that opens and closes, animating its height.
 *
 *   <Collapsible heading="Lesson notes">…</Collapsible>
 *   <Collapsible open={open} onOpenChange={setOpen} trigger={<Button>Show more</Button>}>…</Collapsible>
 *
 * - `heading`: a built-in toggle with a chevron
 * - `trigger`: your own toggle instead (it gets the trigger's props, so a
 *   component must pass them on, as Button does)
 * - `open`, `defaultOpen`; `onOpenChange`: called with the new open state
 * - `disabled`
 *
 * By hand, with Ark's parts:
 *
 *   <Collapsible.Root>
 *     <Collapsible.Trigger>Notes <Collapsible.Indicator>▾</Collapsible.Indicator></Collapsible.Trigger>
 *     <Collapsible.Content>…</Collapsible.Content>
 *   </Collapsible.Root>
 */
import type { ReactElement, ReactNode } from 'react'
import { Collapsible as Ark, type CollapsibleOpenChangeDetails } from '@ark-ui/react/collapsible'
import '../icons.js'
import { cx, on, partsOf, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './collapsible.css'

export type CollapsibleProps = Omit<Ark.RootProps, 'onOpenChange'> & {
  heading?: ReactNode
  trigger?: ReactElement | null
  onOpenChange?: (open: boolean, details: CollapsibleOpenChangeDetails) => void
  classes?: Classes<'root' | 'trigger' | 'heading' | 'indicator' | 'content' | 'inner'>
}

function CollapsibleShortcut({ heading = null, trigger = null, onOpenChange, className, classes, children, ...rest }: CollapsibleProps) {
  const part = partsOf('collapsible', classes)
  return (
    <Ark.Root {...rest} {...part('root')} className={cx(className, classes?.root)}
      {...on('onOpenChange', onOpenChange, (details: CollapsibleOpenChangeDetails) => details.open)}>
      {trigger
        ? <Ark.Trigger asChild>{trigger}</Ark.Trigger>
        : heading && (
          <Ark.Trigger {...part('trigger')}>
            <span {...part('heading')}>{heading}</span>
            <Ark.Indicator {...part('indicator')}><iconify-icon icon="lucide:chevron-down" /></Ark.Indicator>
          </Ark.Trigger>
        )}
      <Ark.Content {...part('content')}>
        <div {...part('inner')}>{children}</div>
      </Ark.Content>
    </Ark.Root>
  )
}

export const Collapsible = withParts(CollapsibleShortcut, {
  Root: Ark.Root, RootProvider: Ark.RootProvider, Trigger: Ark.Trigger, Indicator: Ark.Indicator, Content: Ark.Content, Context: Ark.Context,
})
