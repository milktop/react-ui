// Select with search: an input that filters the list, loads it, or creates
// items. Used by Select.tsx, which documents the props.
import { useEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react'
import {
  Combobox as Ark, createListCollection, useCombobox,
  type ComboboxInputValueChangeDetails, type ComboboxValueChangeDetails,
} from '@ark-ui/react/combobox'
import { useFieldContext } from '@ark-ui/react/field'
import 'iconify-icon'
import { cx, partOf, partsOf, slot } from '../utils.js'
import { useItems } from './items.js'
import type { InnerProps } from './Select.js'
import '../theme.css'
import './search-select.css'

// The "Create …" option, in the list beside the items.
const CREATE = '\u0000create'
type Creating = { [CREATE]: true, label: string }
const isCreating = (entry: unknown): entry is Creating => typeof entry === 'object' && entry !== null && CREATE in entry

export function SearchSelect<T>({
  label = null, items = [], placeholder = 'Search…', labelKey, valueKey, disabledKey,
  multiple = false, variant = 'subtle', hideSelected = false, closeOnSelect, clearable = false,
  load, debounce = 200, loadingText = 'Loading…', onCreate,
  emptyText = 'No matches', empty, name, size = 'md', placement = 'bottom-start', disabled = false,
  value, defaultValue, onValueChange, renderItem, renderCreate,
  // ListSelect-only props, not for the div.
  searchable: _searchable, tags: _tags, deselectable: _deselectable,
  className, classes, ...rest
}: InnerProps<T>) {
  const field = useFieldContext()
  // Ark stamps data-scope="combobox" on its parts; ours match, for search-select.css.
  const part = partsOf('combobox', classes)
  const { labelOf, valueOf, keyOf, isDisabled, setCurrent, keys } =
    useItems<T>({ labelKey, valueKey, disabledKey, multiple, value, defaultValue, onValueChange })

  // Items found by `load` or made by `onCreate` are remembered, so picked ones keep their labels.
  const [seen, setSeen] = useState<T[]>([])
  const [created, setCreated] = useState<T[]>([])
  const pool = [...(load ? seen : items), ...created]
  const byKey = (key: string) => pool.find((item) => keyOf(item) === key)

  // What's been typed (not the picked item's label), filtering the list:
  // labels starting with it first, then those containing it.
  const [query, setQuery] = useState('')
  const [loaded, setLoaded] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const loader = useRef(load)
  loader.current = load

  // With `load`, the server filters: ask it (debounced), keeping only the latest answer.
  useEffect(() => {
    if (!loader.current) return
    let current = true
    setLoading(true)
    const timer = setTimeout(async () => {
      const list = [...await loader.current!(query)]
      if (!current) return
      setLoaded(list)
      setSeen((seen) => [...seen.filter((item) => !list.some((it) => keyOf(it) === keyOf(item))), ...list])
      setLoading(false)
      // Zag highlighted the first item as they typed, when the list was empty
      // (loading); do it now the results are in, so Enter picks it.
      if (query && list.length) setTimeout(() => {
        if (api.current.open) input.current?.dispatchEvent(new globalThis.KeyboardEvent('keydown', { key: 'Home', bubbles: true }))
      }, 30)
    }, debounce)
    return () => { current = false; clearTimeout(timer) }
  }, [query, !!load, debounce]) // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(() => {
    if (load) return loading ? [] : loaded
    const q = query.toLowerCase()
    if (!q) return [...items]
    const text = (item: T) => labelOf(item).toLowerCase()
    return [...items.filter((item) => text(item).startsWith(q)), ...items.filter((item) => !text(item).startsWith(q) && text(item).includes(q))]
  }, [items, query, load, loading, loaded, labelKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const picked = multiple ? keys.map(byKey).filter((item) => item !== undefined) : []

  // The list as shown, and the selected items it doesn't show (left out by a
  // search or `hideSelected`). Zag still needs those to know their labels, so
  // they stay in its collection, disabled so the keys skip them, but unrendered.
  const listed = hideSelected && multiple ? shown.filter((item) => !keys.includes(keyOf(item))) : shown
  const offList = keys.filter((key) => !listed.some((item) => keyOf(item) === key)).map(byKey).filter((item) => item !== undefined)

  // The "Create …" option: for typed text that matches no item.
  const typed = query.trim()
  const creating: Creating | null = onCreate && typed && !loading && !pool.some((item) => labelOf(item).toLowerCase() === typed.toLowerCase())
    ? { [CREATE]: true, label: typed } : null

  type Entry = T | Creating
  const collection = useMemo(() => createListCollection<Entry>({
    items: [...listed, ...(creating ? [creating] : []), ...offList],
    itemToString: (entry) => (isCreating(entry) ? entry.label : labelOf(entry)),
    itemToValue: (entry) => (isCreating(entry) ? CREATE : keyOf(entry)),
    isItemDisabled: (entry) => !isCreating(entry) && ((offList as Entry[]).includes(entry) || isDisabled(entry)),
  }), [listed.map(keyOf).join('\u0000'), creating?.label, offList.map(keyOf).join('\u0000'), labelKey, valueKey, disabledKey]) // eslint-disable-line react-hooks/exhaustive-deps

  async function createFrom(text: string) {
    setQuery('')
    const made = await onCreate!(text)
    const combobox = api.current
    if (made != null) {
      setCreated((created) => [...created, made])
      setCurrent(multiple ? [...keysOf(keys), valueOf(made)] : valueOf(made))
      combobox.setInputValue(multiple ? '' : labelOf(made))
    } else combobox.setInputValue(multiple ? '' : keys.length ? labelOf(byKey(keys[0]) ?? ('' as T)) : '')
  }
  // The current value's items' own values, from their keys.
  const keysOf = (list: string[]) => list.map(byKey).filter((item) => item !== undefined).map(valueOf)

  function inputChange(details: ComboboxInputValueChangeDetails) {
    // Emptying the input clears a single pick; partial edits revert on blur.
    if (details.reason === 'input-change' && !details.inputValue && !multiple && keys.length) queueMicrotask(() => api.current.clearValue())
    if (details.reason === 'input-change') setQuery(details.inputValue)
    else if (!load || details.reason === 'clear-trigger') setQuery('')
  }

  // Zag's values are strings; map them back to the items' own.
  function change(details: ComboboxValueChangeDetails<Entry>) {
    if (details.value.includes(CREATE)) return void createFrom(typed)
    const chosen = keysOf(details.value)
    if (multiple) keepPlace(details.value)
    setCurrent(multiple ? chosen : chosen[0] ?? null)
  }

  const combobox = useCombobox<Entry>({
    collection, value: keys, onValueChange: change, onInputValueChange: inputChange,
    multiple, disabled, placeholder, openOnClick: true, inputBehavior: 'autohighlight',
    closeOnSelect: closeOnSelect ?? !multiple, selectionBehavior: multiple ? 'clear' : 'replace',
    positioning: { placement, sameWidth: true }, ...(name && { name }),
  })
  // The latest api, for the timers and promises here.
  const api = useRef(combobox)
  api.current = combobox
  const input = useRef<HTMLInputElement>(null)

  // Picking several: the highlight stays where it was (on the next item, when
  // the picked one leaves the list), so Enter can pick a run of them. Not
  // after a search, which the pick clears. Zag only acts on Enter once the
  // keys have moved the highlight, so it moves there the way they would.
  function keepPlace(next: string[]) {
    const key = next.find((k) => !keys.includes(k)) ?? keys.find((k) => !next.includes(k))
    const at = listed.findIndex((item) => keyOf(item) === key)
    if (at < 0 || query) return
    setTimeout(() => {
      const n = Math.min(at, listed.length - 1)
      if (n < 0 || !api.current.open) return
      if (n > 0) api.current.setHighlightValue(keyOf(listed[n - 1]))
      // In React the highlight lands on the next render: move on from it after that.
      setTimeout(() => input.current?.dispatchEvent(new globalThis.KeyboardEvent('keydown', { key: n > 0 ? 'ArrowDown' : 'Home', bubbles: true })), 30)
    }, 30)
  }

  // Removes picks. Set here, not by Zag, which won't clear an item that's
  // off the list (disabled in its collection).
  const unpick = (key: string) => setCurrent(keysOf(keys.filter((k) => k !== key)))

  // Backspace in an empty input removes the last pick.
  function removeLast(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Backspace' || !multiple || e.currentTarget.value || !keys.length) return
    unpick(keys.at(-1)!)
  }

  // A click on the box (around the tags, not on a button) types into the input.
  function focusInput(e: MouseEvent) {
    if ((e.target as Element).closest('button, input')) return
    e.preventDefault()
    input.current?.focus()
  }

  // Zag reverts stray text only while the list is open; when focus leaves
  // the whole combobox, put the selected item's label back (or nothing). An
  // emptied input has already cleared the pick (see inputChange).
  function revert(e: FocusEvent<HTMLDivElement>) {
    if (e.currentTarget.contains(e.relatedTarget)) return
    const text = multiple ? '' : keys.length ? labelOf(byKey(keys[0]) ?? ('' as T)) : ''
    const root = e.currentTarget
    // After Zag has handled the blur (closing the list, if a search left it open).
    setTimeout(() => {
      if (root.contains(document.activeElement)) return
      // Tabbing away leaves a multiple select's list open, and its layer then
      // swallows the next field's typing.
      if (api.current.open) api.current.setOpen(false)
      if (api.current.inputValue !== text) api.current.setInputValue(text)
      setQuery('')
    }, 0)
  }

  return (
    <Ark.RootProvider value={combobox} {...rest} {...part('root')} className={cx(className, classes?.root)}
      data-size={size} data-variant={variant} onBlur={revert}>
      {label && !field && <Ark.Label {...part('label')}>{label}</Ark.Label>}
      <Ark.Control {...part('control')} onMouseDown={focusInput}>
        <div {...part('tags')}>
          {picked.map((item) => (
            <span key={keyOf(item)} {...part('tag')}>
              <span {...part('tag-text')}>{labelOf(item)}</span>
              <button {...part('tag-remove')} type="button" tabIndex={-1} aria-label={`Remove ${labelOf(item)}`}
                onClick={(e) => { e.stopPropagation(); unpick(keyOf(item)) }}><iconify-icon icon="lucide:x" /></button>
            </span>
          ))}
          <Ark.Input ref={input} {...part('input')} placeholder={picked.length ? '' : placeholder} onKeyDown={removeLast} />
        </div>
        {clearable && <Ark.ClearTrigger {...part('clear-trigger')}><iconify-icon icon="lucide:x" /></Ark.ClearTrigger>}
        <Ark.Trigger {...part('trigger')}><iconify-icon icon="lucide:chevron-down" /></Ark.Trigger>
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
          {!listed.length && !creating && (
            <div {...part('empty')}>{loading ? loadingText : slot(empty, emptyText, { query: typed })}</div>
          )}
          {creating && (
            <Ark.Item item={creating} {...part('create')}>
              {renderCreate ? renderCreate(creating.label)
                : <><iconify-icon icon="lucide:plus" aria-hidden="true" /><span>Create “{creating.label}”</span></>}
            </Ark.Item>
          )}
        </Ark.Content>
      </Ark.Positioner>
    </Ark.RootProvider>
  )
}

/**
 * Combobox's parts, for a searchable select built by hand (Select's own
 * search mode is built from them):
 *
 *   <Combobox.Root collection={collection} onInputValueChange={…}>
 *     <Combobox.Label>Fruit</Combobox.Label>
 *     <Combobox.Control><Combobox.Input /><Combobox.Trigger>▾</Combobox.Trigger></Combobox.Control>
 *     <Combobox.Positioner><Combobox.Content>…items…</Combobox.Content></Combobox.Positioner>
 *   </Combobox.Root>
 */
export const Combobox = {
  Root: Ark.Root,
  RootProvider: Ark.RootProvider,
  Label: Ark.Label,
  Control: Ark.Control,
  Input: Ark.Input,
  Trigger: Ark.Trigger,
  ClearTrigger: Ark.ClearTrigger,
  Positioner: Ark.Positioner,
  Content: Ark.Content,
  List: Ark.List,
  Item: Ark.Item,
  ItemText: Ark.ItemText,
  ItemIndicator: Ark.ItemIndicator,
  ItemGroup: Ark.ItemGroup,
  ItemGroupLabel: Ark.ItemGroupLabel,
  Empty: Ark.Empty,
  Context: Ark.Context,
  Tags: partOf('combobox', 'tags'),
  Tag: partOf('combobox', 'tag', 'span'),
}
