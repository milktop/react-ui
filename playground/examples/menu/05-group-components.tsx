/* Groups as child components
  Menu.Group wraps its items under a heading (marked up as a group for screen readers). */
import { useState } from 'react'
import { Menu, Button } from '@milktop/react-ui'

export default function Example() {
  const [selected, setSelected] = useState<unknown>(null)
  return <>
    <Menu label="Maths with Ada" onSelect={setSelected} trigger={<Button iconEnd="lucide:chevron-down">Lesson</Button>}>
      <Menu.Group label="Lesson">
        <Menu.Item value="reschedule" icon="lucide:calendar-clock">Reschedule</Menu.Item>
        <Menu.Item value="notes" icon="lucide:notebook-pen">Add notes</Menu.Item>
      </Menu.Group>
      <Menu.Separator />
      <Menu.Group label="Student">
        <Menu.Item value="message" icon="lucide:message-square">Send message</Menu.Item>
        <Menu.Item value="profile" icon="lucide:user">View profile</Menu.Item>
      </Menu.Group>
    </Menu>
    <p className="m-0 w-full text-sm text-(--ui-muted)">selected: {JSON.stringify(selected)}</p>
  </>
}
