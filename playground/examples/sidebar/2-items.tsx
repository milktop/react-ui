/* From data
  `items` builds the sections, items and groups (a group opens when one of its items is active); `footer` holds a SidebarUser. */
import { Sidebar, SidebarUser, toaster, type SidebarSection } from '@milktop/react-ui'

const nav: SidebarSection[] = [
  { items: [
    { label: 'Dashboard', icon: 'lucide:house', href: '#/sidebar' },
    { label: 'Calendar', icon: 'lucide:calendar', href: '#/sidebar', badge: 3 },
  ] },
  { heading: 'Teaching', items: [
    { label: 'Students', icon: 'lucide:users', items: [
      { label: 'All students', href: '#/sidebar', active: true },
      { label: 'Archived', href: '#/sidebar' },
    ] },
  ] },
]

const account = [
  { label: 'Profile', value: 'profile', icon: 'lucide:user' },
  { label: 'Settings', value: 'settings', icon: 'lucide:settings', shortcut: '⌘,' },
  { separator: true },
  { label: 'Log out', value: 'logout', icon: 'lucide:log-out', danger: true },
]

export default function Example() {
  return (
    <div className="h-96 w-full max-w-60 overflow-hidden rounded-xl border border-(--ui-border)">
      <Sidebar items={nav} logo="TutorApp" className="h-full"
        footer={<SidebarUser name="Ada Lovelace" description="ada@example.com" items={account}
          onSelect={(action) => toaster.info({ title: `Picked “${String(action)}”` })} />} />
    </div>
  )
}
