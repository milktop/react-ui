/* Context menu
  ContextMenu opens the same menu at the pointer when you right-click (or long-press) its area. */
import { useState } from 'react'
import { ContextMenu, Menu, type MenuEntry } from '@milktop/react-ui'

const actions: MenuEntry[] = [
  { value: 'edit', label: 'Edit', icon: 'lucide:pencil', shortcut: '⌘E' },
  { value: 'duplicate', label: 'Duplicate', icon: 'lucide:copy', shortcut: '⌘D' },
  { value: 'delete', label: 'Delete', icon: 'lucide:trash-2', danger: true },
]

export default function Example() {
  const [selected, setSelected] = useState<unknown>(null)
  return <>
    <ContextMenu items={actions} label="Lesson" onSelect={setSelected} trigger={(
      <div className="grid h-32 w-full place-items-center rounded-(--ui-radius) border border-dashed border-(--ui-border) text-sm text-(--ui-muted) select-none data-[state=open]:border-(--ui-accent) data-[state=open]:text-(--ui-text)">
        Right-click here
      </div>
    )}>
      <Menu.Separator />
      <Menu.Submenu label="Move to" icon="lucide:folder-input">
        <Menu.Item value="maths">Maths</Menu.Item>
        <Menu.Item value="physics">Physics</Menu.Item>
      </Menu.Submenu>
    </ContextMenu>
    <p className="m-0 w-full text-sm text-(--ui-muted)">selected: {JSON.stringify(selected)}</p>
  </>
}
