/* Actions
  Icons, shortcuts, a disabled item, a separator and a danger item. */
import { useState } from 'react'
import { Menu, Button, type MenuEntry } from '@milktop/react-ui'

const actions: MenuEntry[] = [
  { value: 'edit', label: 'Edit', icon: 'lucide:pencil', shortcut: '⌘E' },
  { value: 'duplicate', label: 'Duplicate', icon: 'lucide:copy', shortcut: '⌘D' },
  { value: 'share', label: 'Share', icon: 'lucide:share-2', disabled: true },
  { separator: true },
  { value: 'delete', label: 'Delete', icon: 'lucide:trash-2', danger: true },
]

export default function Example() {
  const [selected, setSelected] = useState<unknown>(null)
  return <>
    <Menu items={actions} onSelect={setSelected} trigger={<Button iconEnd="lucide:chevron-down">Actions</Button>} />
    <p className="m-0 w-full text-sm text-(--ui-muted)">selected: {JSON.stringify(selected)}</p>
  </>
}
