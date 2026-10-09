/* Links and select handlers
  Items with `href` are links, so middle-click and "open in new tab" work. Neither needs a `value`: an item without one uses its label. A Menu.Item can take its own `onSelect` (Enter selects the highlighted item too). */
import { useState } from 'react'
import { Menu, Button, type MenuEntry } from '@milktop/react-ui'

const pages: MenuEntry[] = [
  { label: 'Buttons', icon: 'lucide:mouse-pointer-click', href: '#/button' },
  { label: 'Dialogs', icon: 'lucide:app-window', href: '#/dialog' },
  { separator: true },
  { label: 'Copy page link', icon: 'lucide:link' },
]

export default function Example() {
  const [selected, setSelected] = useState<unknown>(null)
  const [clicked, setClicked] = useState<string | null>(null)
  return <>
    <Menu items={pages} onSelect={setSelected} trigger={<Button iconEnd="lucide:chevron-down">Go to</Button>} />
    <Menu trigger={<Button iconEnd="lucide:chevron-down">More</Button>}>
      <Menu.Item href="#/button" icon="lucide:mouse-pointer-click">Buttons</Menu.Item>
      <Menu.Item href="#/dialog" icon="lucide:app-window">Dialogs</Menu.Item>
      <Menu.Separator />
      <Menu.Item icon="lucide:link" onSelect={() => setClicked('Copy page link')}>Copy page link</Menu.Item>
    </Menu>
    <p className="m-0 w-full text-sm text-(--ui-muted)">{JSON.stringify({ selected, clicked })}</p>
  </>
}
