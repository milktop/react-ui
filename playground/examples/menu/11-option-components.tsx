/* Checkbox and radio items as child components
  `checked` with `onCheckedChange`, and `value` with `onValueChange`. Only the checkboxes have `keepOpen`, so picking a sort order closes the menu. */
import { useState } from 'react'
import { Menu, Button } from '@milktop/react-ui'

export default function Example() {
  const [showGrid, setShowGrid] = useState(true)
  const [showRulers, setShowRulers] = useState(false)
  const [sort, setSort] = useState<string | number>('name')
  return <>
    <Menu trigger={<Button iconEnd="lucide:chevron-down">View</Button>}>
      <Menu.Checkbox checked={showGrid} onCheckedChange={setShowGrid} keepOpen>Show grid</Menu.Checkbox>
      <Menu.Checkbox checked={showRulers} onCheckedChange={setShowRulers} shortcut="⌘R" keepOpen>Show rulers</Menu.Checkbox>
      <Menu.Separator />
      <Menu.RadioGroup value={sort} onValueChange={setSort} label="Sort by">
        <Menu.Radio value="name">Name</Menu.Radio>
        <Menu.Radio value="date">Date</Menu.Radio>
        <Menu.Radio value="size">Size</Menu.Radio>
      </Menu.RadioGroup>
    </Menu>
    <p className="m-0 w-full text-sm text-(--ui-muted)">{JSON.stringify({ showGrid, showRulers, sort })}</p>
  </>
}
