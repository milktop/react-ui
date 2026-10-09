/* Label and sections
  `label` sits above the items. For sections, add `{ group: "Label" }` items (and `{ separator: true }` lines) between them. */
import { useState } from 'react'
import { Menu, Button, type MenuEntry } from '@milktop/react-ui'

const account: MenuEntry[] = [
  { value: 'profile', label: 'Profile', icon: 'lucide:user' },
  { value: 'settings', label: 'Settings', icon: 'lucide:settings' },
  { separator: true },
  { value: 'logout', label: 'Log out', icon: 'lucide:log-out' },
]
const lesson: MenuEntry[] = [
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
    <Menu items={account} label="My account" onSelect={setSelected} trigger={<Button iconEnd="lucide:chevron-down">Account</Button>} />
    <Menu items={lesson} label="Maths with Ada" onSelect={setSelected} trigger={<Button iconEnd="lucide:chevron-down">Lesson</Button>} />
    <p className="m-0 w-full text-sm text-(--ui-muted)">selected: {JSON.stringify(selected)}</p>
  </>
}
