/* Submenus
  An entry with its own `items` opens a submenu, on hover or the right arrow key. Submenus nest, and their selections reach the outer menu's `onSelect`. */
import { useState } from 'react'
import { Menu, Button, type MenuEntry } from '@milktop/react-ui'

const file: MenuEntry[] = [
  { value: 'new', label: 'New lesson', icon: 'lucide:file-plus', shortcut: '⌘N' },
  { label: 'Share', icon: 'lucide:share-2', items: [
    { value: 'email', label: 'Email', icon: 'lucide:mail' },
    { value: 'link', label: 'Copy link', icon: 'lucide:link' },
    { label: 'Export', icon: 'lucide:download', items: [{ value: 'pdf', label: 'PDF' }, { value: 'csv', label: 'CSV' }] },
  ] },
  { separator: true },
  { value: 'archive', label: 'Archive', icon: 'lucide:archive' },
]

export default function Example() {
  const [selected, setSelected] = useState<unknown>(null)
  return <>
    <Menu items={file} onSelect={setSelected} trigger={<Button iconEnd="lucide:chevron-down">File</Button>} />
    <p className="m-0 w-full text-sm text-(--ui-muted)">selected: {JSON.stringify(selected)}</p>
  </>
}
