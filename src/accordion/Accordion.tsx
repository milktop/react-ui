/**
 * Sections behind headings that expand them.
 *
 *   <Accordion value={open} onValueChange={setOpen}>
 *     <Accordion.Item value="pricing" heading="How much are lessons?">…</Accordion.Item>
 *     <Accordion.Item value="cancel" heading="Can I cancel?">…</Accordion.Item>
 *   </Accordion>
 *
 *   <Accordion items={[{ value: 'pricing', heading: 'How much are lessons?', content: '…' }]} />
 *
 * Arrow keys move between headings, Home/End jump to the ends.
 *
 * - `value`, `defaultValue`: the open item's value (or null), or an array of
 *   them with `multiple`; `onValueChange`: called with the new one
 * - `multiple`: several open at once
 * - `collapsible`: the open item can be closed again (default true)
 * - `items`: `{ value, heading, content, disabled }`, before any children
 * - Accordion.Item (also AccordionItem): `value`, `heading` (text or
 *   markup), `disabled`; its content is what it expands
 *
 * By hand, Ark's parts are here too: Accordion.Root, ItemTrigger,
 * ItemIndicator, ItemContent… (Accordion.Item is ours; Ark's is
 * Accordion.RawItem).
 */
import { createContext, useContext, useRef, type ReactNode } from 'react'
import { Accordion as Ark } from '@ark-ui/react/accordion'
import '../icons.js'
import { cx, partsOf, useControllable, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './accordion.css'

type Value = string | number
type Part = ReturnType<typeof partsOf>

export type AccordionEntry = { value: Value, heading: ReactNode, content?: ReactNode, disabled?: boolean }

export type AccordionProps<V extends Value = Value> = Omit<Ark.RootProps, 'value' | 'defaultValue' | 'onValueChange' | 'multiple' | 'collapsible'> & {
  value?: V | V[] | null
  defaultValue?: V | V[] | null
  onValueChange?: (value: V | V[] | null) => void
  multiple?: boolean
  collapsible?: boolean
  items?: AccordionEntry[] | null
  classes?: Classes<'root' | 'item' | 'heading' | 'itemTrigger' | 'headingText' | 'itemIndicator' | 'itemContent' | 'inner'>
}

// The items register their values (numbers stay numbers) by string key.
const AccordionContext = createContext<{ part: Part, remember: (value: Value) => void } | null>(null)

const keys = (value: Value | Value[] | null | undefined) => ([] as Value[]).concat(value ?? []).map(String)

function AccordionShortcut<V extends Value = Value>({
  value, defaultValue = null, onValueChange, multiple = false, collapsible = true, items = null,
  className, classes, children, ...rest
}: AccordionProps<V>) {
  const part = partsOf('accordion', classes)
  const values = useRef(new Map<string, Value>())
  const [current, setCurrent] = useControllable<V | V[] | null>(value, defaultValue, onValueChange)

  return (
    <AccordionContext value={{ part, remember: (v) => { values.current.set(String(v), v) } }}>
      <Ark.Root {...rest} {...part('root')} className={cx(className, classes?.root)} multiple={multiple}
        collapsible={multiple || collapsible} value={keys(current)}
        onValueChange={(details) => {
          const picked = details.value.map((key) => (values.current.get(key) ?? key) as V)
          setCurrent(multiple ? picked : (picked[0] ?? null))
        }}>
        {(items ?? []).map((item) => (
          <AccordionItem key={item.value} value={item.value} heading={item.heading} disabled={item.disabled}>{item.content}</AccordionItem>
        ))}
        {children}
      </Ark.Root>
    </AccordionContext>
  )
}

export type AccordionItemProps = Omit<Ark.ItemProps, 'value'> & { value: Value, heading?: ReactNode }

/** One section of an Accordion: a heading button and the content it expands. */
export function AccordionItem({ value, heading = null, disabled = false, className, children, ...rest }: AccordionItemProps) {
  const accordion = useContext(AccordionContext)
  const part = accordion?.part ?? partsOf('accordion')
  accordion?.remember(value)
  return (
    <Ark.Item {...rest} {...part('item')} className={cx(className, part('item').className)} value={String(value)} disabled={disabled}>
      <h3 {...part('heading')}>
        <Ark.ItemTrigger {...part('item-trigger')}>
          <span {...part('heading-text')}>{heading}</span>
          <Ark.ItemIndicator {...part('item-indicator')}><iconify-icon icon="lucide:chevron-down" /></Ark.ItemIndicator>
        </Ark.ItemTrigger>
      </h3>
      <Ark.ItemContent {...part('item-content')}>
        <div {...part('inner')}>{children}</div>
      </Ark.ItemContent>
    </Ark.Item>
  )
}

export const Accordion = withParts(AccordionShortcut, {
  Item: AccordionItem,
  Root: Ark.Root,
  RootProvider: Ark.RootProvider,
  RawItem: Ark.Item,
  ItemTrigger: Ark.ItemTrigger,
  ItemIndicator: Ark.ItemIndicator,
  ItemContent: Ark.ItemContent,
  Context: Ark.Context,
  ItemContext: Ark.ItemContext,
})
