/* Items and child components together
  Child components follow the `items`. A Submenu takes `items` too, and a plain string is both an item's label and its value. */
import { useState } from 'react'
import { Menu, Button, type MenuEntry } from '@milktop/react-ui'

const account: MenuEntry[] = [
  { value: 'profile', label: 'Profile', icon: 'lucide:user' },
  { value: 'settings', label: 'Settings', icon: 'lucide:settings' },
]

export default function Example() {
  const [selected, setSelected] = useState<unknown>(null)
  return <>
    <Menu items={account} onSelect={setSelected} trigger={<Button iconEnd="lucide:chevron-down">Account</Button>}>
      <Menu.Separator />
      <Menu.Submenu label="Theme" icon="lucide:palette" items={['Light', 'Dark', 'System']} />
    </Menu>
    <p className="m-0 w-full text-sm text-(--ui-muted)">selected: {JSON.stringify(selected)}</p>
  </>
}
