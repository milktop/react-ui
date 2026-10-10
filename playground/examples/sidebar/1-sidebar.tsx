/* A sidebar
  Sections of nav items with badges, and `accordion` groups (opening one closes the other), with the `--ui-sidebar-*` tokens setting the active item's look. (Shown in a box here.) */
import { useState, type CSSProperties } from 'react'
import { Sidebar, NavSection, NavGroup, NavItem } from '@milktop/react-ui'

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
        <NavSection heading="Menu">
          {menu.map((item) => (
            <NavItem key={item.name} icon={item.icon} badge={item.badge} href="#/sidebar" active={current === item.name}
              onClick={(e) => { e.preventDefault(); setCurrent(item.name) }}>{item.name}</NavItem>
          ))}
        </NavSection>
        <NavSection heading="Settings" collapsible>
          <NavGroup label="Account" icon="lucide:user" defaultOpen>
            <NavItem href="#/sidebar">Profile</NavItem>
            <NavItem href="#/sidebar">Billing</NavItem>
          </NavGroup>
          <NavGroup label="School" icon="lucide:school">
            <NavItem href="#/sidebar">Terms</NavItem>
            <NavItem href="#/sidebar">Rooms</NavItem>
          </NavGroup>
        </NavSection>
      </Sidebar>
    </div>
  )
}
