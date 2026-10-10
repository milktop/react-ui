/* Flat and inset
  The same shell both ways: flat (white sidebar and top bar, bordered) and `inset` (the page a rounded panel on a frame, a grey sidebar with white items). Shown in boxes here; normally it fills the window. */
import { AppShell, Sidebar, NavSection, NavItem, Topbar, Breadcrumbs, Page, Button } from '@milktop/react-ui'

export default function Example() {
  return [false, true].map((inset) => (
    <div key={String(inset)} className="h-72 w-full overflow-hidden rounded-xl border border-(--ui-border) sm:w-[calc(50%-0.375rem)]">
      <AppShell inset={inset} shortcut={false} breakpoint={0} className="h-full min-h-0 [--ui-sidebar-width:9rem]">
        <Sidebar className="h-full" logo="TutorApp">
          <NavSection>
            <NavItem icon="lucide:house" href="#/app-shell" active>Dashboard</NavItem>
            <NavItem icon="lucide:users" href="#/app-shell">Students</NavItem>
          </NavSection>
        </Sidebar>
        <Topbar end={<Button size="sm" round icon="lucide:bell" count={2} aria-label="Notifications" />}>
          <Breadcrumbs items={[{ label: 'Home', href: '#/app-shell' }, { label: 'Dashboard' }]} />
        </Topbar>
        <Page heading={inset ? 'Inset' : 'Flat'} className="text-sm">The page.</Page>
      </AppShell>
    </div>
  ))
}
