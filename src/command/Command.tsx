/**
 * A command menu (⌘K): a dialog with a search box over a list of commands,
 * filtered as you type.
 *
 *   <Command items={commands} onSelect={run} trigger={<Button icon="lucide:search">Search</Button>} />
 *
 * ⌘K (Ctrl+K elsewhere) opens and closes it; ↑/↓ move through the results,
 * Enter picks one, Escape closes it.
 *
 * - `items`: objects with `label`, plus optional `value`, `group` (a heading
 *   the item is listed under), `icon`, `description`, `shortcut` text,
 *   `keywords` (extra words to match) and `disabled`. An item with `href`
 *   goes there when picked
 * - `load`: optional async function(query) returning items, for server
 *   search (debounced by `debounce` ms, `loadingText` meanwhile)
 * - `onSelect`: called with the item's `value` (or the item, if it has none)
 * - `trigger`: the element that opens it (it gets the trigger's props)
 * - `open`, `defaultOpen`; `onOpenChange`: called with the new open state
 * - `hotkey`: the key used with ⌘/Ctrl ('k'); null turns the shortcut off
 * - `navigate`: function(href) for items with `href`, e.g. your router's
 *   `navigate`; by default a link is clicked
 * - `placeholder`, `emptyText`, `label`; `hints`: false hides the keyboard
 *   hints along the bottom
 *
 * `formatHotkey('k')` gives how the shortcut reads here ('⌘K' or 'Ctrl K'),
 * for a trigger's hint.
 */
import { useEffect, useRef, useState, type ReactElement } from 'react'
import { Dialog } from '@ark-ui/react/dialog'
import { Listbox, createListCollection, useListbox, type ListboxScrollToIndexDetails } from '@ark-ui/react/listbox'
import { Portal } from '@ark-ui/react/portal'
import 'iconify-icon'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './command.css'

export type CommandItem = {
  label: string
  value?: unknown
  href?: string
  group?: string
  icon?: string
  description?: string
  shortcut?: string
  keywords?: string[]
  disabled?: boolean
}

export type CommandProps = Omit<Dialog.ContentProps, 'onSelect'> & {
  items?: CommandItem[]
  load?: ((query: string) => Promise<CommandItem[] | null | undefined>) | null
  debounce?: number
  onSelect?: (value: unknown) => void
  trigger?: ReactElement | null
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  hotkey?: string | null
  navigate?: ((href: string) => void) | null
  label?: string
  placeholder?: string
  emptyText?: string
  loadingText?: string
  hints?: boolean
  classes?: Classes<'backdrop' | 'positioner' | 'content' | 'search' | 'searchIcon' | 'input' | 'list' | 'status' | 'group' | 'groupLabel'
    | 'item' | 'icon' | 'text' | 'label' | 'description' | 'shortcut' | 'hints' | 'key'>
}

// How the shortcut reads on this platform: '⌘K' or 'Ctrl K'.
export function formatHotkey(key = 'k') {
  const mac = /Mac|iPhone|iPad/.test(globalThis.navigator?.platform ?? '')
  return mac ? `⌘${key.toUpperCase()}` : `Ctrl ${key.toUpperCase()}`
}

const keyOf = (item: CommandItem) => String(item.value ?? item.href ?? item.label)

// Every word typed must appear in the label, description, group or keywords.
function matches(item: CommandItem, words: string[]) {
  const text = [item.label, item.description, item.group, ...(item.keywords ?? [])].join(' ').toLowerCase()
  return words.every((word) => text.includes(word))
}

function go(href: string) {
  const link = document.createElement('a')
  link.href = href
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function Command({
  items = [], load = null, debounce = 200, onSelect, trigger = null, open: openProp, defaultOpen = false, onOpenChange,
  hotkey = 'k', navigate = null, label: labelProp, placeholder: placeholderProp,
  emptyText: emptyTextProp, loadingText: loadingTextProp, hints = true, className, classes, ...rest
}: CommandProps) {
  const t = useMessages()
  const label = labelProp ?? t.command.label
  const placeholder = placeholderProp ?? t.command.placeholder
  const emptyText = emptyTextProp ?? t.command.empty
  const loadingText = loadingTextProp ?? t.command.loading
  const part = partsOf('command', classes)
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const [query, setQuery] = useState('')
  const [loaded, setLoaded] = useState<CommandItem[]>([])
  const [loading, setLoading] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const listEl = useRef<HTMLDivElement>(null)
  const ticket = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const found = load ? loaded : words.length ? items.filter((item) => matches(item, words)) : items

  // Results in group order (by first appearance), so the list reads and the
  // arrow keys move the same way.
  const groups = [...new Set(found.map((item) => item.group ?? ''))]
    .map((name) => ({ name, items: found.filter((item) => (item.group ?? '') === name) }))
  const results = groups.flatMap((group) => group.items)
  const collection = createListCollection({
    items: results, itemToString: (item) => item.label, itemToValue: keyOf, isItemDisabled: (item) => !!item.disabled,
  })

  function search(text: string) {
    setQuery(text)
    if (!load) return
    const mine = ++ticket.current
    setLoading(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const list = await load(text)
      if (mine !== ticket.current) return
      setLoading(false)
      setLoaded(list ?? [])
    }, debounce)
  }

  function choose(key: string) {
    const item = results.find((item) => keyOf(item) === key)
    if (!item) return
    setOpen(false)
    onSelect?.(item.value === undefined ? item : item.value)
    if (item.href) (navigate ?? go)(item.href)
  }

  // Keeps the highlighted item in view, scrolling only the list, and showing
  // a group's heading along with its first item.
  function scrollToItem({ getElement }: ListboxScrollToIndexDetails) {
    const el = getElement()
    const box = listEl.current
    if (!el || !box) return
    const top0 = box.getBoundingClientRect().top
    const offset = (node: Element) => node.getBoundingClientRect().top - top0 + box.scrollTop
    const group = el.closest('[data-part=item-group]')
    const first = group && group.querySelector('[data-part=item]') === el
    const top = offset(first ? group : el) - 4
    const bottom = offset(el) + el.offsetHeight + 4
    if (top < box.scrollTop) box.scrollTop = top
    else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight
  }

  // The value stays empty, so picking the same command again still counts.
  const list = useListbox({
    collection, value: [], loopFocus: true, scrollToIndexFn: scrollToItem, onSelect: (details) => choose(details.value),
  })
  const api = useRef(list)
  useEffect(() => { api.current = list })

  // Each time it opens (from the trigger, the hotkey or `open`): an empty
  // search over all the commands.
  const latestSearch = useRef(search)
  useEffect(() => { latestSearch.current = search })
  useEffect(() => {
    if (!open) return
    setLoaded([])
    latestSearch.current('')
  }, [open])

  // The first result stays highlighted as the results change, so Enter picks it.
  const resultKeys = results.map(keyOf).join('\u0000')
  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => api.current.highlightFirst(), 0)
    return () => clearTimeout(id)
  }, [open, resultKeys])

    useEffect(() => {
    if (!hotkey) return
    function keydown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== hotkey) return
      e.preventDefault()
      setOpen(!open)
    }
    addEventListener('keydown', keydown)
    return () => removeEventListener('keydown', keydown)
  }, [hotkey, open, setOpen])

  return (
    <Dialog.Root open={open} onOpenChange={(details) => setOpen(details.open)} lazyMount unmountOnExit
      initialFocusEl={() => input.current}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Portal>
        <Dialog.Backdrop {...part('backdrop')} />
        <Dialog.Positioner {...part('positioner')}>
          <Dialog.Content {...rest} {...part('content')} className={cx(className, classes?.content)}>
            {/* Hidden, yet still the dialog's name: aria-labelledby reads hidden elements. */}
            <Dialog.Title {...part('title')} hidden>{label}</Dialog.Title>
            {/* The listbox parts keep Ark's scope, which the CSS targets inside the command. */}
            <Listbox.RootProvider value={list}>
              <Listbox.Label hidden>{label}</Listbox.Label>
              <div {...part('search')}>
                <iconify-icon {...part('search-icon')} icon="lucide:search" aria-hidden="true" />
                <Listbox.Input ref={input} className={classes?.input} autoHighlight type="text" placeholder={placeholder}
                  value={query} onChange={(e) => search(e.target.value)} />
                <kbd {...part('key')} data-esc="">{t.command.esc}</kbd>
              </div>
              <Listbox.Content ref={listEl} className={classes?.list}>
                {/* Earlier results stay while a search runs. */}
                {!results.length
                  ? <div {...part('status')}>{loading ? loadingText : emptyText}</div>
                  : groups.map((group) => (
                      <Listbox.ItemGroup key={group.name} className={classes?.group}>
                        {group.name && <Listbox.ItemGroupLabel className={classes?.groupLabel}>{group.name}</Listbox.ItemGroupLabel>}
                        {group.items.map((item) => (
                          <Listbox.Item key={keyOf(item)} item={item} highlightOnHover className={classes?.item}>
                            {item.icon && <iconify-icon {...part('icon')} icon={item.icon} aria-hidden="true" />}
                            <span {...part('text')}>
                              <span {...part('label')}>{item.label}</span>
                              {item.description && <span {...part('description')}>{item.description}</span>}
                            </span>
                            {item.shortcut && <kbd {...part('shortcut')}>{item.shortcut}</kbd>}
                          </Listbox.Item>
                        ))}
                      </Listbox.ItemGroup>
                    ))}
              </Listbox.Content>
              {hints && (
                <div {...part('hints')} aria-hidden="true">
                  <span><kbd {...part('key')}>↑</kbd><kbd {...part('key')}>↓</kbd> {t.command.toNavigate}</span>
                  <span><kbd {...part('key')}>↵</kbd> {t.command.toSelect}</span>
                </div>
              )}
            </Listbox.RootProvider>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
