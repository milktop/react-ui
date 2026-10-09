/* Groups, aligned to the end */
import { useState } from 'react'
import { Menu, Button, type MenuEntry } from '@milktop/react-ui'

const more: MenuEntry[] = [
  { group: 'Lesson' },
  { value: 'reschedule', label: 'Reschedule', icon: 'lucide:calendar-clock' },
  { value: 'notes', label: 'Add notes', icon: 'lucide:notebook-pen' },
  { separator: true },
  { group: 'Student' },
  { value: 'message', label: 'Send message', icon: 'lucide:message-square' },
  { value: 'profile', label: 'View profile', icon: 'lucide:user' },
]

export default function Example() {
  const [selected, setSelected] = useState<unknown>(null)
  return <>
    <span className="flex items-center gap-2">Maths with Ada, Thursday 16:00
      <Menu items={more} placement="bottom-end" onSelect={setSelected} trigger={<Button variant="ghost" icon="lucide:ellipsis" aria-label="More" />} />
    </span>
    <p className="m-0 w-full text-sm text-(--ui-muted)">selected: {JSON.stringify(selected)}</p>
  </>
}
