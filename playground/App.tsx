import { useEffect, useState } from 'react'
import 'iconify-icon'
import {
  AppShell, Sidebar, NavSection, NavGroup, NavItem, SidebarUser, Topbar, Breadcrumbs, Page, Command, formatHotkey,
  MenuItem, MenuSeparator, Submenu, MenuRadioGroup, MenuRadio, ThemeToggle, Toaster, toaster, colorScheme, useColorScheme, cx,
  type CommandItem, type Scheme,
} from '@milktop/react-ui'
import { Demo, Toggle, Backticked } from './lib/Demo'
import { groups, pages, examplesOf, docOf, type Group, type Page as PageEntry } from './registry'

function useHash() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const change = () => { setHash(location.hash); scrollTo(0, 0) }
    addEventListener('hashchange', change)
    return () => removeEventListener('hashchange', change)
  }, [])
  return hash
}

// ⌘K: every page, then a few actions.
const commands: CommandItem[] = [
  ...pages.map((p) => ({ label: p.title, description: p.about, href: `#/${p.slug}`, icon: p.group.icon, group: p.group.heading })),
  { label: 'Toggle sidebar', value: 'sidebar', icon: 'lucide:panel-left', shortcut: '⌘B', group: 'Playground' },
  { label: 'Light theme', value: 'light', icon: 'lucide:sun', group: 'Playground', keywords: ['appearance', 'mode'] },
  { label: 'Dark theme', value: 'dark', icon: 'lucide:moon', group: 'Playground', keywords: ['appearance', 'mode'] },
]

function run(command: unknown) {
  if (command === 'sidebar') dispatchEvent(new KeyboardEvent('keydown', { key: 'b', metaKey: true, ctrlKey: true }))
  else if (command === 'light' || command === 'dark') colorScheme.value = command
}

export function App() {
  const hash = useHash()
  const page = pages.find((p) => hash === `#/${p.slug}`)
  const { scheme, setScheme } = useColorScheme()
  // The open group (one at a time): the current page's, whenever the page changes.
  const [opened, setOpened] = useState(page?.group.heading ?? null)
  const [shownPage, setShownPage] = useState(page)
  if (page !== shownPage) {
    setShownPage(page)
    if (page) setOpened(page.group.heading)
  }
  const trail = page
    ? [{ label: 'React UI', href: '#/' }, { label: page.group.heading }, { label: page.title }]
    : [{ label: 'React UI', href: '#/' }, { label: 'Overview' }]

  return (
    <AppShell persist="react-ui:sidebar">
      <Sidebar
        logoCollapsed={<a href="#/" aria-label="React UI" className={mark}>UI</a>}
        logo={<a href="#/" className="flex items-center gap-2 text-(--ui-text) no-underline"><span className={mark}>UI</span>React UI</a>}
        footer={
          <SidebarUser name="Ada Lovelace" description="ada@example.com" onSelect={(action) => toaster.info({ title: `Picked “${String(action)}”` })}>
            <MenuItem value="profile" icon="lucide:user">Profile</MenuItem>
            <MenuItem value="settings" icon="lucide:settings" shortcut="⌘,">Settings</MenuItem>
            <Submenu label="Theme" icon="lucide:palette">
              <MenuRadioGroup value={scheme} onValueChange={(value) => setScheme(value as Scheme)}>
                <MenuRadio value="light" icon="lucide:sun">Light</MenuRadio>
                <MenuRadio value="dark" icon="lucide:moon">Dark</MenuRadio>
                <MenuRadio value="system" icon="lucide:monitor">System</MenuRadio>
              </MenuRadioGroup>
            </Submenu>
            <MenuSeparator />
            <MenuItem value="logout" icon="lucide:log-out" danger>Log out</MenuItem>
          </SidebarUser>
        }>
        <NavSection>
          <NavItem icon="lucide:house" href="#/" active={!page}>Overview</NavItem>
        </NavSection>
        <NavSection heading="Components">
          {groups.map((group) => (
            <NavGroup key={group.heading} label={group.heading} icon={group.icon}
              open={opened === group.heading} onOpenChange={(open) => setOpened(open ? group.heading : null)}>
              {group.pages.map((p) => <NavItem key={p.slug} href={`#/${p.slug}`} active={p.slug === page?.slug}>{p.title}</NavItem>)}
            </NavGroup>
          ))}
        </NavSection>
      </Sidebar>

      <Topbar end={<>
        <Command items={commands} onSelect={run} trigger={
          <button type="button" className="flex h-8 cursor-pointer items-center gap-2 rounded-(--ui-radius) border border-(--ui-border) bg-(--ui-surface) px-2.5 text-sm text-(--ui-muted) hover:border-(--ui-muted) hover:text-(--ui-text) md:w-56 md:pr-1.5">
            <iconify-icon icon="lucide:search" aria-hidden="true" />
            <span className="hidden flex-1 text-left md:block">Search</span>
            <kbd className="hidden h-5 items-center rounded border border-(--ui-border) bg-(--ui-hover) px-1.5 font-[inherit] text-[11px] md:inline-flex">{formatHotkey()}</kbd>
          </button>
        } />
        <ThemeToggle size="sm" />
      </>}>
        <Breadcrumbs items={trail} />
      </Topbar>

      <Page>
        {page ? <ComponentPage key={page.slug} page={page} /> : <Overview />}
      </Page>
      <Toaster />
    </AppShell>
  )
}

const mark = 'inline-flex h-7 w-7 items-center justify-center rounded-(--ui-radius) bg-(--ui-accent) text-xs font-bold text-(--ui-accent-text) no-underline'

function ComponentPage({ page }: { page: PageEntry & { group: Group } }) {
  const [showDoc, setShowDoc] = useState(false)
  const doc = docOf(page.file)

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="m-0 text-xl font-bold">{page.title}</h1>
        <Toggle pressed={showDoc} onClick={() => setShowDoc(!showDoc)} icon="lucide:list-tree">Props</Toggle>
      </div>
      <p className="mt-1 mb-0 text-sm text-(--ui-muted)"><Backticked text={doc.summary} /></p>
      {showDoc && (
        <pre className="mt-5 mb-0 overflow-x-auto rounded-[calc(var(--ui-radius)+6px)] border border-(--ui-border) bg-(--ui-surface) p-4 text-xs leading-relaxed whitespace-pre-wrap">
          {doc.text}
        </pre>
      )}
      {examplesOf(page.slug).map((example) => (
        <Demo key={example.path} example={example} form={page.form ?? !!page.group.form} />
      ))}
    </>
  )
}

function Overview() {
  return (
    <>
      <h1 className="m-0 text-xl font-bold">React UI</h1>
      <p className="mt-1 mb-0 text-sm text-(--ui-muted)">
        React components on Ark UI, with imba-ui's API and design. Each one is a shortcut
        (<code>{'<Checkbox label="…" />'}</code>) with its parts on it, for building it by hand
        (<code>{'<Checkbox.Root>…</Checkbox.Root>'}</code>).
      </p>
      {groups.map((group) => (
        <section key={group.heading}>
          <h2 className="mt-8 mb-3 text-xs font-semibold tracking-wider text-(--ui-muted) uppercase">{group.heading}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.pages.map((p) => (
              <a key={p.slug} href={`#/${p.slug}`}
                className={cx('block rounded-lg border border-(--ui-border) bg-(--ui-surface) p-3 text-inherit no-underline shadow-(--ui-card-shadow) hover:border-(--ui-muted)')}>
                <strong className="block text-sm font-semibold">{p.title}</strong>
                <span className="mt-0.5 block text-xs text-(--ui-muted)">{p.about}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
