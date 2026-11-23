// Select with search: an input that filters the list, loads it, or creates
// items. Used by Select.tsx, which documents the props.
import { useContext, useEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react'
import {
  Combobox as Ark, createListCollection, useCombobox,
  type ComboboxInputValueChangeDetails, type ComboboxValueChangeDetails,
} from '@ark-ui/react/combobox'
import { useFieldContext } from '@ark-ui/react/field'
import { Portal } from '@ark-ui/react/portal'
import '../icons.js'
import { cx, fold, partOf, partsOf, slot } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import { InLayer } from '../layer.js'
import { useItems } from './items.js'
import type { InnerProps } from './Select.js'
import '../theme.css'
import './search-select.css'

// The "Create …" option, in the list beside the items.
const CREATE = '\u0000create'
type Creating = { [CREATE]: true, label: string }
const isCreating = (entry: unknown): entry is Creating => typeof entry === 'object' && entry !== null && CREATE in entry

export function SearchSelect<T>({
  label = null, items = [], placeholder: placeholderProp, labelKey, valueKey, disabledKey,
  multiple = false, variant = 'subtle', hideSelected = false, closeOnSelect, clearable = false,
  load, debounce = 200, loadingText: loadingTextProp, onCreate,
  emptyText: emptyTextProp, empty, name, size = 'md', placement = 'bottom-start', disabled = false,
  value, defaultValue, onValueChange, renderItem, renderValue, start, renderCreate,
  // ListSelect-only props, not for the div.
  searchable: _searchable, tags: tagsProp, deselectable: _deselectable,
  className, classes, ...rest
}: InnerProps<T>) {
  const t = useMessages()
  const placeholder = placeholderProp ?? t.select.searchPlaceholder
  const loadingText = loadingTextProp ?? t.select.loading
  const emptyText = emptyTextProp ?? t.select.noMatches
  const field = useFieldContext()
  // Ark stamps data-scope="combobox" on its parts; ours match, for search-select.css.
  const part = partsOf('combobox', classes)
  const { labelOf, valueOf, keyOf, isDisabled, setCurrent, keys } =
    useItems<T>({ labelKey, valueKey, disabledKey, multiple, value, defaultValue, onValueChange })

  // Items found by `load` or made by `onCreate` are remembered, so picked ones keep their labels.
  const [seen, setSeen] = useState<T[]>([])
  const [created, setCreated] = useState<T[]>([])
  // Picking several, the picks show as tags in the box unless `tags` is false (shown elsewhere)
  const tags = tagsProp !== false
  // With `load`, `items` are those already known (the current value's), for their labels
  const pool = [...(load ? [...items, ...seen] : items), ...created]
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
    const q = fold(query)
    if (!q) return [...items]
    const text = (item: T) => fold(labelOf(item))
    return [...items.filter((item) => text(item).startsWith(q)), ...items.filter((item) => !text(item).startsWith(q) && text(item).includes(q))]
  }, [items, query, load, loading, loaded, labelKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const picked = multiple && tags ? keys.map(byKey).filter((item) => item !== undefined) : []

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
    const typing = details.reason === 'input-change'
    // Picking one, the box shows its label: a search typed after it (a key, a phone's keyboard, a
    // paste) replaces it rather than adding to it.
    const shown = !multiple && !query && keys.length ? byKey(keys[0]) : undefined
    const label = shown === undefined ? '' : labelOf(shown)
    if (typing && label && details.inputValue.length > label.length && details.inputValue.startsWith(label)) {
      const search = details.inputValue.slice(label.length)
      queueMicrotask(() => api.current.setInputValue(search, 'input-change'))
      return
    }
    // Emptying the input clears a single pick; partial edits revert on blur.
    if (typing && !details.inputValue && !multiple && keys.length) queueMicrotask(() => api.current.clearValue())
    if (typing) setQuery(details.inputValue)
    else if (!load || details.reason === 'clear-trigger') setQuery('')
  }

  // Zag's values are strings; map them back to the items' own.
  function change(details: ComboboxValueChangeDetails<Entry>) {
    if (details.value.includes(CREATE)) return void createFrom(typed)
    const chosen = keysOf(details.value)
    if (multiple) keepPlace(details.value)
    setCurrent(multiple ? chosen : chosen[0] ?? null)
  }

  // Opened from a dialog or sheet, it shows on top of it (as Popover does)
  const layered = useContext(InLayer) ? { 'data-layered': '' } : {}
  const combobox = useCombobox<Entry>({
    collection, value: keys, onValueChange: change, onInputValueChange: inputChange, onHighlightChange: highlightShown,
    multiple, disabled, placeholder, openOnClick: true, inputBehavior: 'autohighlight',
    ...(t.zag.combobox && { translations: t.zag.combobox }),
    closeOnSelect: closeOnSelect ?? !multiple,
    // Left open after a pick with no tags to clear it for, the search stays as typed, for the next pick
    selectionBehavior: multiple && tags ? 'clear' : multiple || closeOnSelect === false ? 'preserve' : 'replace',
    positioning: { placement, sameWidth: true, strategy: 'fixed' }, ...(name && { name }),
  })
  // The latest api, for the timers and promises here.
  const api = useRef(combobox)
  api.current = combobox
  const input = useRef<HTMLInputElement>(null)

  // Picking several: the highlight stays where it was, so Enter can pick a run
  // of them. A picked item that stays listed keeps it; one that leaves
  // (`hideSelected`) hands it to the next, before it goes, so it doesn't blink
  // (Zag clears a highlight whose item is removed). Not after a search the
  // pick clears (with tags): the whole list comes back.
  function keepPlace(next: string[]) {
    if (!hideSelected || (query && tags)) return
    const key = next.find((k) => !keys.includes(k))
    const at = listed.findIndex((item) => keyOf(item) === key)
    const following = listed[at + 1] ?? listed[at - 1]
    if (at >= 0 && following) api.current.setHighlightValue(keyOf(following))
  }

  // Opening by the keys highlights the first pick, which may be off the list
  // (`hideSelected`, a search): Enter would then unpick it unseen. The first
  // item shown instead.
  function highlightShown({ highlightedValue }: { highlightedValue: string | null }) {
    const hidden = highlightedValue != null && offList.some((item) => keyOf(item) === highlightedValue)
    // After Zag's own step (opening), which would otherwise undo it
    if (hidden && listed.length) setTimeout(() => api.current.setHighlightValue(keyOf(listed[0])), 0)
  }

  // Removes picks. Set here, not by Zag, which won't clear an item that's
  // off the list (disabled in its collection).
  const unpick = (key: string) => setCurrent(keysOf(keys.filter((k) => k !== key)))

  // Backspace in an empty input removes the last pick (one shown as a tag).
  function removeLast(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Backspace' || !picked.length || e.currentTarget.value || !keys.length) return
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
        {start != null && <span {...part('start')}>{typeof start === 'function' ? start((keys[0] !== undefined ? byKey(keys[0]) : undefined) ?? null) : start}</span>}
        <div {...part('tags')}>
          {picked.map((item) => (
            <span key={keyOf(item)} {...part('tag')}>
              <span {...part('tag-text')}>{renderValue ? renderValue(item) : labelOf(item)}</span>
              <button {...part('tag-remove')} type="button" tabIndex={-1} aria-label={t.common.remove(labelOf(item))}
                onClick={(e) => { e.stopPropagation(); unpick(keyOf(item)) }}><iconify-icon icon="lucide:x" /></button>
            </span>
          ))}
          <Ark.Input ref={input} {...part('input')} placeholder={picked.length ? '' : placeholder} onKeyDown={removeLast} />
        </div>
        {clearable && <Ark.ClearTrigger {...part('clear-trigger')}><iconify-icon icon="lucide:x" /></Ark.ClearTrigger>}
        <Ark.Trigger {...part('trigger')}><iconify-icon icon="lucide:chevron-down" /></Ark.Trigger>
      </Ark.Control>

      {/* At the end of the page, as Popover: a dialog's scrolling body would clip it to the room left inside it */}
      <Portal>
        <Ark.Positioner {...part('positioner')} {...layered}>
          <Ark.Content {...part('content')} {...layered}>
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
                  : <><iconify-icon icon="lucide:plus" aria-hidden="true" /><span>{t.select.create(creating.label)}</span></>}
              </Ark.Item>
            )}
          </Ark.Content>
        </Ark.Positioner>
      </Portal>
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
