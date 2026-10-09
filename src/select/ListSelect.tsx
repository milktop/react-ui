// Select without search: a button that opens the list. Used by Select.tsx,
// which documents the props.
import { useMemo, useRef, type KeyboardEvent } from 'react'
import { Select as Ark, createListCollection, useSelect, type SelectValueChangeDetails } from '@ark-ui/react/select'
import { useFieldContext } from '@ark-ui/react/field'
import 'iconify-icon'
import { cx, partsOf, slot } from '../utils.js'
import { useItems } from './items.js'
import type { InnerProps } from './Select.js'
import '../theme.css'
import './select.css'

export function ListSelect<T>({
  label = null, items = [], placeholder = 'Select…', labelKey, valueKey, disabledKey,
  multiple = false, tags = false, variant = 'subtle', hideSelected = false, deselectable = false, closeOnSelect, clearable = false,
  emptyText = 'No options', empty, name, size = 'md', placement = 'bottom-start', disabled = false,
  value, defaultValue, onValueChange, renderItem,
  // Search-only props, not for the div.
  searchable: _searchable, load: _load, debounce: _debounce, loadingText: _loadingText, onCreate: _onCreate, renderCreate: _renderCreate,
  className, classes, ...rest
}: InnerProps<T>) {
  const field = useFieldContext()
  const part = partsOf('select', classes)
  const { labelOf, valueOf, keyOf, isDisabled, setCurrent, keys } =
    useItems<T>({ labelKey, valueKey, disabledKey, multiple, value, defaultValue, onValueChange })

  // With hideSelected the picked items aren't rendered, but stay in Zag's
  // collection (for their labels), disabled so the keys skip them.
  const hidden = (item: T) => hideSelected && multiple && keys.includes(keyOf(item))
  const listed = items.filter((item) => !hidden(item))

  const collection = useMemo(() => createListCollection<T>({
    items: [...items],
    itemToString: labelOf,
    itemToValue: keyOf,
    isItemDisabled: (item) => hidden(item) || isDisabled(item),
  }), [items, labelKey, valueKey, disabledKey, hideSelected, multiple, keys.join('\u0000')]) // eslint-disable-line react-hooks/exhaustive-deps

  // The items' own values for Zag's keys.
  const valuesOf = (list: string[]) => list.map((key) => items.find((item) => keyOf(item) === key)).filter((item) => item !== undefined).map(valueOf)

  function change(details: SelectValueChangeDetails<T>) {
    const chosen = valuesOf(details.value)
    if (multiple) keepPlace(details.value)
    setCurrent(multiple ? chosen : chosen[0] ?? null)
  }

  // Opening highlights the pick, which hideSelected hides (and Enter would
  // then untick unseen): highlight the first item shown instead.
  function openChange({ open }: { open: boolean }) {
    if (open && hideSelected && multiple && listed.length) setTimeout(() => api.current.setHighlightValue(keyOf(listed[0])), 0)
  }

  const select = useSelect<T>({
    collection, value: keys, onValueChange: change, onOpenChange: openChange, multiple, deselectable, closeOnSelect: closeOnSelect ?? !multiple, disabled,
    positioning: { placement, sameWidth: true }, ...(name && { name }),
  })
  // The latest api, for the timers below.
  const api = useRef(select)
  api.current = select

  // Picking several: the highlight stays where it was (on the next item, when
  // the picked one leaves the list), so Enter can pick a run of them.
  function keepPlace(next: string[]) {
    const key = next.find((k) => !keys.includes(k)) ?? keys.find((k) => !next.includes(k))
    const at = listed.findIndex((item) => keyOf(item) === key)
    if (at < 0) return
    setTimeout(() => {
      const shown = items.filter((item) => !(hideSelected && next.includes(keyOf(item))))
      const item = shown[Math.min(at, shown.length - 1)]
      if (item && api.current.open) api.current.setHighlightValue(keyOf(item))
    }, 30)
  }

  // Backspace on the closed button removes the last pick. Set here, not by
  // Zag, which won't clear an item hideSelected has disabled.
  function removeLast(e: KeyboardEvent) {
    if (e.key !== 'Backspace' || !multiple || select.open || !keys.length) return
    setCurrent(valuesOf(keys.slice(0, -1)))
  }

  return (
    <Ark.RootProvider value={select} {...rest} {...part('root')} className={cx(className, classes?.root)} data-size={size} data-variant={variant}>
      {label && !field && <Ark.Label {...part('label')}>{label}</Ark.Label>}
      <Ark.Control {...part('control')}>
        <Ark.Trigger {...part('trigger')} onKeyDown={removeLast}>
          {multiple && tags && select.hasSelectedItems
            // Chips, not buttons (a button can't hold buttons): untick an item to remove it.
            ? <span {...part('tags')}>
                {(select.selectedItems as T[]).map((item) => (
                  <span key={keyOf(item)} {...part('tag')}><span {...part('tag-text')}>{labelOf(item)}</span></span>
                ))}
              </span>
            : <Ark.ValueText {...part('value-text')} placeholder={placeholder} />}
          <Ark.Indicator {...part('indicator')}><iconify-icon icon="lucide:chevron-down" /></Ark.Indicator>
        </Ark.Trigger>
        {clearable && <Ark.ClearTrigger {...part('clear-trigger')}><iconify-icon icon="lucide:x" /></Ark.ClearTrigger>}
      </Ark.Control>

      <Ark.Positioner {...part('positioner')}>
        <Ark.Content {...part('content')}>
          {listed.map((item) => (
            <Ark.Item key={keyOf(item)} item={item} {...part('item')}>
              <Ark.ItemText {...part('item-text')}>
                {renderItem ? renderItem(item, { selected: keys.includes(keyOf(item)) }) : labelOf(item)}
              </Ark.ItemText>
              <Ark.ItemIndicator {...part('item-indicator')}><iconify-icon icon="lucide:check" /></Ark.ItemIndicator>
            </Ark.Item>
          ))}
          {!listed.length && <div {...part('empty')}>{slot(empty, emptyText, { query: '' })}</div>}
        </Ark.Content>
      </Ark.Positioner>
      <Ark.HiddenSelect />
    </Ark.RootProvider>
  )
}
