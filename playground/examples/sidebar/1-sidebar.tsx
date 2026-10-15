/* A sidebar
  Sections of nav items with badges, and `accordion` groups (opening one closes the other), with the `--ui-sidebar-*` tokens setting the active item's look. (Shown in a box here.) */
import { useState, type CSSProperties } from 'react'
import { Sidebar } from '@milktop/react-ui'

const menu = [
  { name: 'Dashboard', icon: 'lucide:house' },
  { name: 'Students', icon: 'lucide:users', badge: 12 },
  { name: 'Lessons', icon: 'lucide:book-open', badge: 'New' },
]

export default function Example() {
  const [current, setCurrent] = useState('Dashboard')
  return (
    <div className="h-96 w-full max-w-60 overflow-hidden rounded-xl border border-(--ui-border)">
      <Sidebar accordion logo="TutorApp" className="h-full"
        style={{ '--ui-sidebar-item-height': '2.5rem', '--ui-sidebar-active': 'var(--ui-accent-soft)' } as CSSProperties}>
        <Sidebar.Section heading="Menu">
          {menu.map((item) => (
            <Sidebar.Item key={item.name} icon={item.icon} badge={item.badge} href="#/sidebar" active={current === item.name}
              onClick={(e) => { e.preventDefault(); setCurrent(item.name) }}>{item.name}</Sidebar.Item>
          ))}
        </Sidebar.Section>
        <Sidebar.Section heading="Settings" collapsible>
          <Sidebar.Group label="Account" icon="lucide:user" defaultOpen>
            <Sidebar.Item href="#/sidebar">Profile</Sidebar.Item>
            <Sidebar.Item href="#/sidebar">Billing</Sidebar.Item>
          </Sidebar.Group>
          <Sidebar.Group label="School" icon="lucide:school">
            <Sidebar.Item href="#/sidebar">Terms</Sidebar.Item>
            <Sidebar.Item href="#/sidebar">Rooms</Sidebar.Item>
          </Sidebar.Group>
        </Sidebar.Section>
      </Sidebar>
    </div>
  )
}
