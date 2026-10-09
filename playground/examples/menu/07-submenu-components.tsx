/* Submenus as child components */
import { useState } from 'react'
import { Menu, Button } from '@milktop/react-ui'

export default function Example() {
  const [selected, setSelected] = useState<unknown>(null)
  return <>
    <Menu onSelect={setSelected} trigger={<Button iconEnd="lucide:chevron-down">File</Button>}>
      <Menu.Item value="new" icon="lucide:file-plus" shortcut="⌘N">New lesson</Menu.Item>
      <Menu.Submenu label="Share" icon="lucide:share-2">
        <Menu.Item value="email" icon="lucide:mail">Email</Menu.Item>
        <Menu.Item value="link" icon="lucide:link">Copy link</Menu.Item>
        <Menu.Submenu label="Export" icon="lucide:download">
          <Menu.Item value="pdf">PDF</Menu.Item>
          <Menu.Item value="csv">CSV</Menu.Item>
        </Menu.Submenu>
      </Menu.Submenu>
      <Menu.Separator />
      <Menu.Item value="archive" icon="lucide:archive">Archive</Menu.Item>
    </Menu>
    <p className="m-0 w-full text-sm text-(--ui-muted)">selected: {JSON.stringify(selected)}</p>
  </>
}
