/* Actions as child components
  Menu.Item takes the same options as `items` entries, and its content is the label. */
import { useState } from 'react'
import { Menu, Button } from '@milktop/react-ui'

export default function Example() {
  const [selected, setSelected] = useState<unknown>(null)
  return <>
    <Menu onSelect={setSelected} trigger={<Button iconEnd="lucide:chevron-down">Actions</Button>}>
      <Menu.Item value="edit" icon="lucide:pencil" shortcut="⌘E">Edit</Menu.Item>
      <Menu.Item value="duplicate" icon="lucide:copy" shortcut="⌘D">Duplicate</Menu.Item>
      <Menu.Item value="share" icon="lucide:share-2" disabled>Share</Menu.Item>
      <Menu.Separator />
      <Menu.Item value="delete" icon="lucide:trash-2" danger>Delete</Menu.Item>
    </Menu>
    <p className="m-0 w-full text-sm text-(--ui-muted)">selected: {JSON.stringify(selected)}</p>
  </>
}
