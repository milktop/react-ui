/**
 * A select: pick from a list. A button that opens it, or, with `searchable`,
 * `load` or `onCreate`, an input you type into to filter it.
 *
 *   <Select label="Level" items={['GCSE', 'A Level']} value={level} onValueChange={setLevel} />
 *   <Select label="Student" items={students} labelKey="name" valueKey="id" searchable defaultValue={2} />
 *   <Select label="City" load={searchCities} labelKey="name" valueKey="id" />
 *   <Select label="Topics" items={topics} multiple onCreate={addTopic} value={picked} onValueChange={setPicked} />
 *
 * - `items`: strings, or objects (see `labelKey`, `valueKey`, `disabledKey`)
 * - `value`, `defaultValue`: the item's own value, or an array of them with `multiple`
 * - `onValueChange`: called with the new value (items' own values, not strings)
 * - `multiple`: pick several; picked items show ticked in the list
 * - `tags`: with `multiple`, show the picks as tags in the box (always, when
 *   searchable); `variant` sets their look: 'subtle', 'accent' or 'outline'
 * - `hideSelected`: with `multiple`, picked items leave the list
 * - `searchable`: type to filter the list (labels starting with the text first)
 * - `load`: async function(query) returning items, for server search; implies
 *   searchable (debounced by `debounce` ms, `loadingText` meanwhile)
 * - `onCreate`: function(query) called when someone picks "Create …" for text
 *   that matches no item; implies searchable. Return the new item (or a
 *   promise of it) to select it, or handle it yourself
 * - `deselectable`: clicking the picked item again clears it (without search)
 * - `closeOnSelect`: close the list after a pick (on by default, except with `multiple`)
 * - `clearable`: a button to clear it
 * - `placeholder`, `emptyText` (when nothing matches)
 * - `name`: for plain form posts
 * - `size`: 'sm' or 'md'; `placement`: where the list opens ('bottom-start')
 * - `renderItem`: an option's content, (item, { selected }) => node
 * - `renderValue`: the chosen item's content in the closed select (and each
 *   tag's, picking several), (item) => node; with search, the box holds
 *   typed text, so use `start` there
 * - `start`: before the value (or the search box): a node, or (item) => node
 *   given the chosen item (the first, picking several; null if none), e.g.
 *   a colour's dot
 * - `renderCreate`: the create option's content, (query) => node
 * - `empty`: shown when nothing matches, a node or ({ query }) => node
 *
 * Picking several, the highlight stays put (on the next item, when the
 * picked one leaves the list), so Enter picks a run of them; Backspace in
 * an empty box removes the last pick.
 *
 * By hand, with Ark's parts (and `createListCollection` for the items):
 *
 *   <Select.Root collection={collection}>
 *     <Select.Label>Level</Select.Label>
 *     <Select.Control>
 *       <Select.Trigger><Select.ValueText placeholder="Pick one" /><Select.Indicator>▾</Select.Indicator></Select.Trigger>
 *     </Select.Control>
 *     <Select.Positioner>
 *       <Select.Content>
 *         {collection.items.map((item) => (
 *           <Select.Item key={item.value} item={item}><Select.ItemText>{item.label}</Select.ItemText></Select.Item>
 *         ))}
 *       </Select.Content>
 *     </Select.Positioner>
 *     <Select.HiddenSelect />
 *   </Select.Root>
 *
 * With search, the same with Combobox's parts (Combobox.Input in the control).
 */
import type { ComponentProps, ReactNode } from 'react'
import { Select as Ark, createListCollection } from '@ark-ui/react/select'
import { ListSelect } from './ListSelect.js'
import { SearchSelect } from './SearchSelect.js'
import { partOf, withParts, type Classes, type Slot } from '../utils.js'

type Primitive = string | number
// An item's own value: the item itself (strings, numbers), or its `valueKey`.
export type ItemValue<T, K extends string> = T extends Primitive ? T : K extends keyof T ? T[K] : unknown

type One<V> = {
  multiple?: false
  value?: V | null
  defaultValue?: V | null
  onValueChange?: (value: V | null) => void
}
type Several<V> = {
  multiple: true
  value?: V[]
  defaultValue?: V[]
  onValueChange?: (value: V[]) => void
}

export type SelectPart = 'root' | 'label' | 'control' | 'trigger' | 'valueText' | 'input' | 'tags' | 'tag' | 'tagText'
  | 'tagRemove' | 'indicator' | 'clearTrigger' | 'positioner' | 'content' | 'item' | 'itemText' | 'itemIndicator'
  | 'empty' | 'create' | 'start'

export type SelectProps<T, K extends string = 'value'> = Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange' | 'children'> & {
  items?: readonly T[]
  label?: ReactNode
  labelKey?: string
  valueKey?: K
  disabledKey?: string
  placeholder?: string
  tags?: boolean
  variant?: 'subtle' | 'accent' | 'outline'
  hideSelected?: boolean
  searchable?: boolean
  load?: (query: string) => Promise<readonly T[]> | readonly T[]
  debounce?: number
  loadingText?: ReactNode
  onCreate?: (query: string) => T | null | undefined | void | Promise<T | null | undefined | void>
  deselectable?: boolean
  closeOnSelect?: boolean
  clearable?: boolean
  emptyText?: ReactNode
  empty?: Slot<{ query: string }>
  name?: string
  size?: 'sm' | 'md'
  placement?: NonNullable<Ark.RootProps<T>['positioning']>['placement']
  disabled?: boolean
  renderItem?: (item: T, state: { selected: boolean }) => ReactNode
  renderValue?: (item: T) => ReactNode
  start?: ReactNode | ((item: T | null) => ReactNode)
  renderCreate?: (query: string) => ReactNode
  classes?: Classes<SelectPart>
} & (One<ItemValue<T, K>> | Several<ItemValue<T, K>>)

// What ListSelect and SearchSelect take: the props with the value loosened
// (the union above is for callers).
export type InnerProps<T> = Omit<SelectProps<T>, 'multiple' | 'value' | 'defaultValue' | 'onValueChange' | 'valueKey'> & {
  valueKey?: string
  multiple?: boolean
  value?: unknown
  defaultValue?: unknown
  onValueChange?: (value: unknown) => void
}

function SelectShortcut<T, K extends string = 'value'>(props: SelectProps<T, K>) {
  const inner = props as unknown as InnerProps<T>
  return inner.searchable || inner.load || inner.onCreate ? <SearchSelect {...inner} /> : <ListSelect {...inner} />
}

export const Select = withParts(SelectShortcut, {
  Root: Ark.Root,
  RootProvider: Ark.RootProvider,
  Label: Ark.Label,
  Control: Ark.Control,
  Trigger: Ark.Trigger,
  ValueText: Ark.ValueText,
  Indicator: Ark.Indicator,
  ClearTrigger: Ark.ClearTrigger,
  Positioner: Ark.Positioner,
  Content: Ark.Content,
  List: Ark.List,
  Item: Ark.Item,
  ItemText: Ark.ItemText,
  ItemIndicator: Ark.ItemIndicator,
  ItemGroup: Ark.ItemGroup,
  ItemGroupLabel: Ark.ItemGroupLabel,
  HiddenSelect: Ark.HiddenSelect,
  Context: Ark.Context,
  Empty: partOf('select', 'empty'),
})

export { createListCollection }
export { Combobox } from './SearchSelect.js'
