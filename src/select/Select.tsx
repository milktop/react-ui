/**
 * A select: a button that opens a list to pick from.
 *
 *   <Select label="Level" items={['GCSE', 'A Level']} value={level} onValueChange={setLevel} />
 *   <Select label="Student" items={students} labelKey="name" valueKey="id" defaultValue={2} />
 *
 * - `items`: strings, or objects (see `labelKey`, `valueKey`, `disabledKey`)
 * - `value`, `defaultValue`: the item's own value, or an array of them with `multiple`
 * - `onValueChange`: called with the new value (items' own values, not strings)
 * - `multiple`: pick several; picked items show ticked in the list
 * - `tags`: with `multiple`, show the picks as tags in the box; `variant`
 *   sets their look: 'subtle', 'accent' or 'outline'
 * - `deselectable`: clicking the picked item again clears it
 * - `closeOnSelect`: close the list after a pick (on by default, except with `multiple`)
 * - `clearable`: a button to clear it
 * - `placeholder`, `emptyText` (when there are no items)
 * - `name`: for plain form posts
 * - `size`: 'sm' or 'md'; `placement`: where the list opens ('bottom-start')
 * - `renderItem`: an option's content, (item, { selected }) => node
 * - `empty`: shown when there are no items, in place of `emptyText`
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
 */
import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { Select as Ark, createListCollection, type SelectValueChangeDetails } from '@ark-ui/react/select'
import { useFieldContext } from '@ark-ui/react/field'
import 'iconify-icon'
import { cx, partOf, partsOf, useControllable, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './select.css'

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

export type SelectProps<T, K extends string = 'value'> = Omit<Ark.RootProps<T>,
  'collection' | 'value' | 'defaultValue' | 'onValueChange' | 'multiple' | 'children' | 'positioning'> & {
  items: readonly T[]
  label?: ReactNode
  labelKey?: string
  valueKey?: K
  disabledKey?: string
  placeholder?: string
  tags?: boolean
  variant?: 'subtle' | 'accent' | 'outline'
  clearable?: boolean
  emptyText?: ReactNode
  empty?: ReactNode
  size?: 'sm' | 'md'
  placement?: NonNullable<Ark.RootProps<T>['positioning']>['placement']
  renderItem?: (item: T, state: { selected: boolean }) => ReactNode
  classes?: Classes<'root' | 'label' | 'control' | 'trigger' | 'valueText' | 'tags' | 'tag' | 'tagText' | 'indicator'
    | 'clearTrigger' | 'positioner' | 'content' | 'item' | 'itemText' | 'itemIndicator' | 'empty'>
} & (One<ItemValue<T, K>> | Several<ItemValue<T, K>>)

function SelectShortcut<T, K extends string = 'value'>(props: SelectProps<T, K>) {
  const {
    label = null, items, value, defaultValue, onValueChange, placeholder = 'Select…',
    labelKey = 'label', valueKey = 'value', disabledKey = 'disabled',
    multiple = false, tags = false, variant = 'subtle', deselectable = false, closeOnSelect, clearable = false,
    emptyText = 'No options', empty, name, size = 'md', placement = 'bottom-start', disabled = false,
    renderItem, className, classes, ...rest
  } = props as SelectProps<T, K> & { value?: unknown, defaultValue?: unknown, onValueChange?: (value: unknown) => void }
  const field = useFieldContext()
  const part = partsOf('select', classes)

  const labelOf = (item: T) => String(typeof item === 'object' && item ? (item as Record<string, unknown>)[labelKey] : item)
  const valueOf = (item: T) => (typeof item === 'object' && item ? (item as Record<string, unknown>)[valueKey] : item)

  // Zag's values are strings: the items' own values map to and from them.
  const [current, setCurrent] = useControllable<unknown>(value, defaultValue ?? (multiple ? [] : null), onValueChange)
  const keys = multiple ? ((current as unknown[]) ?? []).map(String) : current == null ? [] : [String(current)]

  const collection = useMemo(() => createListCollection({
    items,
    itemToString: labelOf,
    itemToValue: (item) => String(valueOf(item)),
    isItemDisabled: (item) => typeof item === 'object' && !!item && !!(item as Record<string, unknown>)[disabledKey],
  }), [items, labelKey, valueKey, disabledKey]) // eslint-disable-line react-hooks/exhaustive-deps

  function change(details: SelectValueChangeDetails<T>) {
    const chosen = details.items.map(valueOf)
    setCurrent(multiple ? chosen : chosen[0] ?? null)
  }

  return (
    <Ark.Root {...rest} {...part('root')} className={cx(className, classes?.root)} data-size={size} data-variant={variant}
      collection={collection} value={keys} onValueChange={change}
      multiple={multiple} deselectable={deselectable} closeOnSelect={closeOnSelect ?? !multiple}
      disabled={disabled} positioning={{ placement, sameWidth: true }} {...(name && { name })}>
      {label && !field && <Ark.Label {...part('label')}>{label}</Ark.Label>}
      <Ark.Control {...part('control')}>
        <Ark.Trigger {...part('trigger')}>
          <Ark.Context>{(api) => multiple && tags && api.hasSelectedItems
            // Chips, not buttons (a button can't hold buttons): untick an item to remove it.
            ? <span {...part('tags')}>
                {(api.selectedItems as T[]).map((item) => (
                  <span key={String(valueOf(item))} {...part('tag')}><span {...part('tag-text')}>{labelOf(item)}</span></span>
                ))}
              </span>
            : <Ark.ValueText {...part('value-text')} placeholder={placeholder} />}
          </Ark.Context>
          <Ark.Indicator {...part('indicator')}><iconify-icon icon="lucide:chevron-down" /></Ark.Indicator>
        </Ark.Trigger>
        {clearable && <Ark.ClearTrigger {...part('clear-trigger')}><iconify-icon icon="lucide:x" /></Ark.ClearTrigger>}
      </Ark.Control>

      <Ark.Positioner {...part('positioner')}>
        <Ark.Content {...part('content')}>
          {items.map((item) => (
            <Ark.Item key={String(valueOf(item))} item={item} {...part('item')}>
              <Ark.ItemText {...part('item-text')}>
                {renderItem ? renderItem(item, { selected: keys.includes(String(valueOf(item))) }) : labelOf(item)}
              </Ark.ItemText>
              <Ark.ItemIndicator {...part('item-indicator')}><iconify-icon icon="lucide:check" /></Ark.ItemIndicator>
            </Ark.Item>
          ))}
          {!items.length && <div {...part('empty')}>{empty ?? emptyText}</div>}
        </Ark.Content>
      </Ark.Positioner>
      <Ark.HiddenSelect />
    </Ark.Root>
  )
}

export const Select = withParts(SelectShortcut, {
  Root: Ark.Root,
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
