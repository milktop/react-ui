/**
 * A dropdown menu of actions from a trigger.
 *
 *   <Menu items={actions} onSelect={run} trigger={<Button iconEnd="lucide:chevron-down">Actions</Button>} />
 *
 *   <Menu onSelect={run} trigger={<Button>File</Button>}>
 *     <Menu.Item value="new" icon="lucide:file-plus" shortcut="⌘N">New</Menu.Item>
 *     <Menu.Submenu label="Share" icon="lucide:share-2"><Menu.Item value="email">Email</Menu.Item></Menu.Submenu>
 *     <Menu.Separator />
 *     <Menu.Group label="Danger zone"><Menu.Item value="delete" danger>Delete</Menu.Item></Menu.Group>
 *   </Menu>
 *
 * Arrow keys move through the items (right and left open and close
 * submenus), typing jumps to one, Enter selects, and Escape or a click outside
 * closes it, returning focus to the trigger. Items come from `items`, from
 * child components (after any `items`), or both.
 *
 * - `items`: strings or objects with `labelKey`/`valueKey`/`disabledKey` (the
 *   label stands in for a missing value), plus optional `icon`, `shortcut`,
 *   `danger` and `href` (a link); `{ separator: true }` draws a line,
 *   `{ group: 'Label' }` a group heading, and `{ label, icon, items: […] }` a
 *   submenu with its own items
 * - Checkbox and radio entries: `{ type: 'checkbox', value, label, checked }`
 *   and `{ type: 'radio', name, value, label, checked }` (one checked per
 *   `name`). The menu keeps them checked and calls `onChange` with
 *   `{ type, name, value, checked }`
 * - `onSelect`: called with the chosen action's value, from submenus too
 * - `trigger`: the element that opens it (it gets the trigger's props, so a
 *   component must pass them on, as Button does)
 * - `placement`: 'bottom-start' (default), 'bottom-end', …
 * - `label`: a small label above the items
 * - `keepOpen`: stay open after an item is chosen (to tick several); an
 *   item's own `keepOpen` overrides it
 * - `context`: open on right-click (or long-press) of the trigger, at the
 *   pointer (see ContextMenu)
 * - `open`, `defaultOpen`; `onOpenChange`
 * - Child components: Menu.Item, Menu.Separator, Menu.Group, Menu.Submenu,
 *   Menu.Checkbox, and Menu.RadioGroup with Menu.Radio (also exported as
 *   MenuItem, MenuSeparator…)
 *
 * By hand, Ark's parts are here too: Menu.Root, Trigger, ContextTrigger,
 * Positioner, Content, ItemText, ItemIndicator, CheckboxItem, RadioItem…
 */
import { createContext, useContext, useId, useRef, useState, type ComponentProps, type ReactElement, type ReactNode } from 'react'
import { Menu as Ark, useMenuContext, type MenuSelectionDetails } from '@ark-ui/react/menu'
import '../icons.js'
import { cx, partsOf, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './menu.css'

type Value = string | number
type Part = ReturnType<typeof partsOf>

export type MenuEntry = string | number | {
  label?: ReactNode, value?: Value, icon?: string, shortcut?: string, danger?: boolean, href?: string,
  disabled?: boolean, keepOpen?: boolean | null, separator?: boolean, group?: ReactNode, items?: MenuEntry[],
  type?: 'checkbox' | 'radio', name?: string, checked?: boolean, [key: string]: unknown,
}
export type MenuOptionChange = { type: 'checkbox' | 'radio', name: string | null, value: unknown, checked: boolean }

// What a menu (or submenu) shares with its items: Zag's item keys are
// strings, so the menu maps them back to the original values for onSelect.
type MenuShared = {
  part: Part
  keepOpen: boolean
  keys: { labelKey: string, valueKey: string, disabledKey: string }
  remember: (key: string, value: unknown) => void
  select: (key: string) => void
  // `items` checkbox and radio entries, kept checked by the root menu.
  isChecked: (key: string, initial: boolean) => boolean
  check: (entry: MenuEntry & object, key: string, on: boolean, siblings: MenuEntry[]) => void
}
const MenuContext = createContext<MenuShared | null>(null)
const useMenu = () => {
  const menu = useContext(MenuContext)
  if (!menu) throw new Error('Menu parts go inside a Menu')
  return menu
}

// Zag's per-item closeOnSelect for a `keepOpen` (unset follows the menu); left out when unset.
const closeFor = (keepOpen: boolean | null | undefined) => (keepOpen == null ? {} : { closeOnSelect: !keepOpen })
// A label's text, when it's plain text, to stand in for a missing value.
const textOf = (node: ReactNode) => (typeof node === 'string' || typeof node === 'number' ? String(node) : '')

type ItemExtras = { icon?: string | null, shortcut?: ReactNode, danger?: boolean, disabled?: boolean, keepOpen?: boolean | null }

// An item's inside: icon, label and shortcut.
function ItemInside({ part, icon, shortcut, children }: { part: Part, icon?: string | null, shortcut?: ReactNode, children?: ReactNode }) {
  return <>
    {icon && <iconify-icon {...part('icon')} icon={icon} aria-hidden="true" />}
    <Ark.ItemText {...part('label')}>{children}</Ark.ItemText>
    {shortcut && <kbd {...part('shortcut')}>{shortcut}</kbd>}
  </>
}

export type MenuItemProps = Omit<ComponentProps<'div'>, 'onSelect'> & ItemExtras & {
  value?: Value
  href?: string | null
  onSelect?: () => void
}

/**
 * One action in a Menu or Menu.Submenu; its content is the label.
 *
 *   <Menu.Item value="edit" icon="lucide:pencil" shortcut="⌘E">Edit</Menu.Item>
 *
 * - `value`: what the menu's `onSelect` gets (the label's text if unset)
 * - `href`: makes it a link
 * - `icon`, `shortcut`, `danger`, `disabled` and `keepOpen`: as on `items` entries
 * - `onSelect`: runs when it's chosen, by pointer or keyboard
 */
function Item({ value, href = null, icon = null, shortcut = null, danger = false, disabled = false, keepOpen = null,
  onSelect, className, children, ...rest }: MenuItemProps) {
  const menu = useMenu()
  const id = useId()
  const itemValue = value ?? (textOf(children) || id)
  const key = String(itemValue)
  menu.remember(key, itemValue)
  const inside = <ItemInside part={menu.part} icon={icon} shortcut={shortcut}>{children}</ItemInside>
  return (
    <Ark.Item {...rest} {...menu.part('item')} className={className} value={key} disabled={!!disabled} {...closeFor(keepOpen)}
      data-danger={danger || undefined} {...(onSelect && { onSelect })} asChild={!!href}>
      {href ? <a href={href}>{inside}</a> : inside}
    </Ark.Item>
  )
}

/** A line between items in a Menu or Menu.Submenu. */
function Separator(props: ComponentProps<'hr'>) {
  const menu = useMenu()
  return <Ark.Separator {...props} {...menu.part('separator')} />
}

/**
 * A group of items in a Menu or Menu.Submenu, under a heading.
 *
 *   <Menu.Group label="Student"><Menu.Item value="message">Send message</Menu.Item></Menu.Group>
 */
function Group({ label = null, children, ...rest }: ComponentProps<'div'> & { label?: ReactNode }) {
  const menu = useMenu()
  return (
    <Ark.ItemGroup {...rest} {...menu.part('item-group')}>
      {label && <Ark.ItemGroupLabel {...menu.part('group-label')}>{label}</Ark.ItemGroupLabel>}
      {children}
    </Ark.ItemGroup>
  )
}

export type MenuCheckboxProps = ItemExtras & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  value?: Value
  children?: ReactNode
}

/**
 * A checkbox item in a Menu or Menu.Submenu; its content is the label.
 *
 *   <Menu.Checkbox checked={showGrid} onCheckedChange={setShowGrid} keepOpen>Show grid</Menu.Checkbox>
 *
 * - `checked`, `defaultChecked`; `onCheckedChange`
 * - `value`, `icon`, `shortcut`, `disabled` and `keepOpen`: as on Menu.Item
 */
function Checkbox({ checked, defaultChecked = false, onCheckedChange, value, icon = null, shortcut = null, disabled = false,
  keepOpen = null, children }: MenuCheckboxProps) {
  const menu = useMenu()
  const id = useId()
  const [own, setOwn] = useState(defaultChecked)
  const on = checked ?? own
  return (
    <Ark.CheckboxItem {...menu.part('item')} value={String(value ?? id)} checked={on} disabled={!!disabled} {...closeFor(keepOpen)}
      onCheckedChange={(next) => { setOwn(next); onCheckedChange?.(next) }}>
      <span {...menu.part('indicator')}>
        <Ark.ItemIndicator {...menu.part('item-indicator')} data-type="checkbox"><iconify-icon icon="lucide:check" aria-hidden="true" /></Ark.ItemIndicator>
      </span>
      <ItemInside part={menu.part} icon={icon} shortcut={shortcut}>{children}</ItemInside>
    </Ark.CheckboxItem>
  )
}

// A radio group's id and value, for its radios.
const RadioContext = createContext<{ id: string, value: Value | null } | null>(null)

/**
 * Radio items in a Menu or Menu.Submenu, one of which is checked.
 *
 *   <Menu.RadioGroup value={sort} onValueChange={setSort} label="Sort by">
 *     <Menu.Radio value="name">Name</Menu.Radio>
 *     <Menu.Radio value="date">Date</Menu.Radio>
 *   </Menu.RadioGroup>
 *
 * - `value`, `defaultValue`; `onValueChange`: called with the checked radio's value
 * - `label`: an optional heading
 */
function RadioGroup({ value, defaultValue = null, onValueChange, label = null, children }: {
  value?: Value | null, defaultValue?: Value | null, onValueChange?: (value: Value) => void, label?: ReactNode, children?: ReactNode
}) {
  const menu = useMenu()
  const id = useId()
  const [own, setOwn] = useState<Value | null>(defaultValue)
  const current = value !== undefined ? value : own
  // Radios register their own values, keyed by the group (two groups can share values).
  const values = useRef(new Map<string, Value>())
  return (
    <RadioContext.Provider value={{ id, value: current }}>
      <Ark.RadioItemGroup {...menu.part('item-group')} value={current == null ? '' : `${id}/${current}`}
        onValueChange={(details) => {
          const next = values.current.get(details.value)
          if (next === undefined) return
          setOwn(next)
          onValueChange?.(next)
        }}>
        {label && <Ark.ItemGroupLabel {...menu.part('group-label')}>{label}</Ark.ItemGroupLabel>}
        <RadioValues.Provider value={values.current}>{children}</RadioValues.Provider>
      </Ark.RadioItemGroup>
    </RadioContext.Provider>
  )
}
const RadioValues = createContext<Map<string, Value> | null>(null)

/**
 * One radio item in a Menu.RadioGroup; its content is the label.
 *
 * - `value`: what the group's value becomes
 * - `icon`, `shortcut`, `disabled` and `keepOpen`: as on Menu.Item
 */
function Radio({ value, icon = null, shortcut = null, disabled = false, keepOpen = null, children }: ItemExtras & { value: Value, children?: ReactNode }) {
  const menu = useMenu()
  const group = useContext(RadioContext)
  const values = useContext(RadioValues)
  const key = `${group?.id}/${value}`
  values?.set(key, value)
  return (
    <Ark.RadioItem {...menu.part('item')} value={key} disabled={!!disabled} {...closeFor(keepOpen)}>
      <span {...menu.part('indicator')}><Ark.ItemIndicator {...menu.part('item-indicator')} data-type="radio" /></span>
      <ItemInside part={menu.part} icon={icon} shortcut={shortcut}>{children}</ItemInside>
    </Ark.RadioItem>
  )
}

/**
 * A submenu inside a Menu (or another Submenu): a row that opens a nested
 * menu of its own items, from `items` or child components like Menu's.
 *
 *   <Menu.Submenu label="Share" icon="lucide:share-2">
 *     <Menu.Item value="email">Email</Menu.Item>
 *   </Menu.Submenu>
 *
 * - `label`: the row's text; `icon`: an optional Iconify name before it
 * - `items`: as on Menu; `keepOpen` for its items (it follows its menu)
 *
 * Its items' selections reach the outer Menu's `onSelect`.
 */
function Submenu({ label, icon = null, items = [], keepOpen = null, className, children }: {
  label: ReactNode, icon?: string | null, items?: MenuEntry[], keepOpen?: boolean | null, className?: string, children?: ReactNode
}) {
  const outer = useMenu()
  const part = outer.part
  const stays = keepOpen ?? outer.keepOpen
  return (
    <Ark.Root closeOnSelect={!stays} positioning={{ placement: 'right-start', strategy: 'fixed', gutter: 2 }}
      navigate={(details) => details.node.click()} onSelect={(details: MenuSelectionDetails) => outer.select(details.value)}>
      <Ark.TriggerItem {...part('item')}>
        {icon && <iconify-icon {...part('icon')} icon={icon} aria-hidden="true" />}
        <span {...part('label')}>{label}</span>
        <iconify-icon {...part('chevron')} icon="lucide:chevron-right" aria-hidden="true" />
      </Ark.TriggerItem>
      <Ark.Positioner {...part('positioner')}>
        <Ark.Content {...part('content')} className={className}>
          <MenuContext.Provider value={{ ...outer, keepOpen: stays }}>
            <Entries items={items} />
            {children}
          </MenuContext.Provider>
        </Ark.Content>
      </Ark.Positioner>
    </Ark.Root>
  )
}

// A checkbox or radio entry from `items`, checked by the root menu. Zag's
// option props straight onto it: Ark's RadioItem wants a RadioItemGroup round it.
function Option({ entry, optionKey, label, disabled, siblings }: {
  entry: MenuEntry & object, optionKey: string, label: ReactNode, disabled: boolean, siblings: MenuEntry[]
}) {
  const menu = useMenu()
  const api = useMenuContext()
  const props = {
    type: entry.type!, value: optionKey, checked: menu.isChecked(optionKey, !!entry.checked), disabled,
    valueText: typeof label === 'string' ? label : optionKey, ...closeFor(entry.keepOpen),
    onCheckedChange: (on: boolean) => menu.check(entry, optionKey, on, siblings),
  }
  return (
    <div {...api.getOptionItemProps(props)} {...menu.part('item')} data-danger={entry.danger || undefined}>
      <span {...menu.part('indicator')}>
        <span {...api.getItemIndicatorProps(props)} {...menu.part('item-indicator')} data-type={entry.type}>
          {entry.type === 'checkbox' && <iconify-icon icon="lucide:check" aria-hidden="true" />}
        </span>
      </span>
      {entry.icon && <iconify-icon {...menu.part('icon')} icon={entry.icon} aria-hidden="true" />}
      <span {...menu.part('label')}>{label}</span>
      {entry.shortcut && <kbd {...menu.part('shortcut')}>{entry.shortcut}</kbd>}
    </div>
  )
}

// A menu's `items` array, as the components above.
function Entries({ items }: { items: MenuEntry[] }) {
  const menu = useMenu()
  const { labelKey, valueKey, disabledKey } = menu.keys
  const field = (entry: object, key: string) => (entry as Record<string, unknown>)[key]
  return <>
    {items.map((entry, i) => {
      if (typeof entry !== 'object') return <Item key={i} value={entry}>{entry}</Item>
      const label = field(entry, labelKey) as ReactNode
      const value = (field(entry, valueKey) ?? label) as Value
      const disabled = !!field(entry, disabledKey)
      if (entry.separator) return <Separator key={i} />
      if (entry.group) return <div key={i} {...menu.part('group-label')}>{entry.group}</div>
      if (entry.items) return <Submenu key={i} label={label} icon={entry.icon} items={entry.items} />
      if (entry.type === 'checkbox' || entry.type === 'radio') {
        // Radio keys include their `name`, so two groups can share values.
        const key = entry.type === 'radio' ? `${entry.name ?? ''}/${value}` : String(value)
        return <Option key={i} entry={entry} optionKey={key} label={label} disabled={disabled} siblings={items} />
      }
      return (
        <Item key={i} value={value} href={entry.href} icon={entry.icon} shortcut={entry.shortcut} danger={entry.danger}
          disabled={disabled} keepOpen={entry.keepOpen}>{label}</Item>
      )
    })}
  </>
}

export type MenuProps = Omit<Ark.ContentProps, 'onSelect' | 'onChange'> & {
  items?: MenuEntry[]
  labelKey?: string
  valueKey?: string
  disabledKey?: string
  trigger?: ReactElement | null
  placement?: NonNullable<Ark.RootProps['positioning']>['placement']
  label?: ReactNode
  keepOpen?: boolean
  context?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onSelect?: (value: unknown) => void
  onChange?: (change: MenuOptionChange) => void
  classes?: Classes<'positioner' | 'content' | 'menuLabel'>
}

function MenuShortcut({
  items = [], labelKey = 'label', valueKey = 'value', disabledKey = 'disabled', trigger = null, placement = 'bottom-start',
  label = null, keepOpen = false, context = false, open, defaultOpen, onOpenChange, onSelect, onChange,
  className, classes, children, ...rest
}: MenuProps) {
  const part = partsOf('menu', classes)
  const values = useRef(new Map<string, unknown>())
  // `items` checkbox and radio entries, starting from their own `checked`.
  const [checks, setChecks] = useState<Record<string, boolean>>({})

  const shared: MenuShared = {
    part, keepOpen, keys: { labelKey, valueKey, disabledKey },
    remember: (key, value) => { values.current.set(key, value) },
    select: (key) => { if (values.current.has(key)) onSelect?.(values.current.get(key)) },
    isChecked: (key, initial) => checks[key] ?? initial,
    check: (entry, key, on, siblings) => {
      const next = { ...checks }
      if (entry.type === 'radio') {
        if (next[key] ?? entry.checked) return
        for (const other of siblings) {
          if (typeof other === 'object' && other.type === 'radio' && other.name === entry.name) {
            next[`${other.name ?? ''}/${other[valueKey] ?? other[labelKey]}`] = false
          }
        }
      }
      next[key] = on
      setChecks(next)
      onChange?.({ type: entry.type!, name: (entry.name as string) ?? null, value: entry[valueKey] ?? entry[labelKey], checked: on })
    },
  }

  const Trigger = context ? Ark.ContextTrigger : Ark.Trigger
  return (
    // Mounted (hidden) from the start, as in svelte-ui: mounting on first open
    // made it grow as its icons loaded.
    <Ark.Root closeOnSelect={!keepOpen} positioning={{ placement, strategy: 'fixed', gutter: 4 }}
      {...(open !== undefined && { open })} {...(defaultOpen !== undefined && { defaultOpen })}
      {...(onOpenChange && { onOpenChange: (details: { open: boolean }) => onOpenChange(details.open) })}
      // Enter on a link: Zag's own click doesn't bubble, so routers listening
      // on the document would miss it.
      navigate={(details) => details.node.click()} onSelect={(details) => shared.select(details.value)}>
      {trigger && <Trigger asChild>{trigger}</Trigger>}
      <Ark.Positioner {...part('positioner')}>
        <Ark.Content {...rest} {...part('content')} className={cx(className, classes?.content)}>
          <MenuContext.Provider value={shared}>
            {label && <div {...part('menu-label')}>{label}</div>}
            <Entries items={items} />
            {children}
          </MenuContext.Provider>
        </Ark.Content>
      </Ark.Positioner>
    </Ark.Root>
  )
}

export const Menu = withParts(MenuShortcut, {
  Item, Separator, Group, Checkbox, RadioGroup, Radio, Submenu,
  Root: Ark.Root,
  Trigger: Ark.Trigger,
  ContextTrigger: Ark.ContextTrigger,
  Positioner: Ark.Positioner,
  Content: Ark.Content,
  ItemText: Ark.ItemText,
  ItemIndicator: Ark.ItemIndicator,
  ItemGroup: Ark.ItemGroup,
  ItemGroupLabel: Ark.ItemGroupLabel,
  CheckboxItem: Ark.CheckboxItem,
  RadioItemGroup: Ark.RadioItemGroup,
  RadioItem: Ark.RadioItem,
  TriggerItem: Ark.TriggerItem,
  Arrow: Ark.Arrow,
  ArrowTip: Ark.ArrowTip,
  Context: Ark.Context,
})

/**
 * A Menu opened by right-clicking (or long-pressing on touch) an area, at the pointer.
 *
 *   <ContextMenu items={actions} onSelect={run} trigger={<div>…the area…</div>} />
 *
 * Takes the same props, `items` and child components (submenus too) as Menu.
 */
export function ContextMenu(props: Omit<MenuProps, 'context'>) {
  return <MenuShortcut {...props} context />
}

export { Item as MenuItem, Separator as MenuSeparator, Group as MenuGroup, Checkbox as MenuCheckbox,
  RadioGroup as MenuRadioGroup, Radio as MenuRadio, Submenu }

