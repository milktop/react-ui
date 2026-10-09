/* Checkbox and radio items
  Entries with `type: "checkbox"` or `type: "radio"` (one checked per `name`). The menu keeps them checked and calls `onChange` with `{ type, name, value, checked }`; `keepOpen` keeps it open while you tick several. */
import { useState } from 'react'
import { Menu, Button, type MenuEntry, type MenuOptionChange } from '@milktop/react-ui'

const view: MenuEntry[] = [
  { type: 'checkbox', value: 'grid', label: 'Show grid', checked: true },
  { type: 'checkbox', value: 'rulers', label: 'Show rulers', shortcut: '⌘R' },
  { separator: true },
  { group: 'Sort by' },
  { type: 'radio', name: 'sort', value: 'name', label: 'Name', checked: true },
  { type: 'radio', name: 'sort', value: 'date', label: 'Date' },
  { type: 'radio', name: 'sort', value: 'size', label: 'Size' },
]

export default function Example() {
  const [changed, setChanged] = useState<MenuOptionChange | null>(null)
  return <>
    <Menu items={view} keepOpen onChange={setChanged} trigger={<Button iconEnd="lucide:chevron-down">View</Button>} />
    <p className="m-0 w-full text-sm text-(--ui-muted)">changed: {JSON.stringify(changed)}</p>
  </>
}
