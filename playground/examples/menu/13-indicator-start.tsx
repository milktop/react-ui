/* Ticks before the label
  Checked checkbox and radio items show a tick after the label by default, so labels line up with the other items. `indicator="start"` puts it before the label instead, with a dot for radios. */
import { useState } from 'react'
import { Menu, Button } from '@milktop/react-ui'

export default function Example() {
  const [showGrid, setShowGrid] = useState(true)
  const [sort, setSort] = useState<string | number>('name')
  return (
    <Menu indicator="start" trigger={<Button iconEnd="lucide:chevron-down">View</Button>}>
      <Menu.Checkbox checked={showGrid} onCheckedChange={setShowGrid} keepOpen>Show grid</Menu.Checkbox>
      <Menu.Separator />
      <Menu.RadioGroup value={sort} onValueChange={setSort} label="Sort by">
        <Menu.Radio value="name">Name</Menu.Radio>
        <Menu.Radio value="date">Date</Menu.Radio>
        <Menu.Radio value="size">Size</Menu.Radio>
      </Menu.RadioGroup>
    </Menu>
  )
}
