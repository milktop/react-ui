import { useEffect, useState } from 'react'
import 'iconify-icon'
import { ThemeToggle, Toaster, cx } from '@milktop/react-ui'
import { Demo, Toggle, Backticked } from './lib/Demo'
import { groups, pages, examplesOf, docOf, type Group, type Page } from './registry'

function useHash() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const change = () => { setHash(location.hash); scrollTo(0, 0) }
    addEventListener('hashchange', change)
    return () => removeEventListener('hashchange', change)
  }, [])
  return hash
}

export function App() {
  const hash = useHash()
  const page = pages.find((p) => hash === `#/${p.slug}`)

  return (
    <div className="flex min-h-screen">
      <nav className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-y-auto border-r border-(--ui-border) bg-(--ui-surface) p-4 md:block">
        <a href="#/" className="mb-4 flex items-center gap-2 font-semibold text-(--ui-text) no-underline">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-(--ui-radius) bg-(--ui-accent) text-xs font-bold text-(--ui-accent-text)">UI</span>
          React UI
        </a>
        {groups.map((group) => (
          <div key={group.heading} className="mt-4">
            <h3 className="m-0 mb-1 flex items-center gap-2 text-xs font-semibold tracking-wider text-(--ui-muted) uppercase">
              <iconify-icon icon={group.icon} />{group.heading}
            </h3>
            {group.pages.map((p) => (
              <a key={p.slug} href={`#/${p.slug}`} aria-current={p === page || undefined}
                className="block rounded-md px-2 py-1 text-sm text-(--ui-text) no-underline hover:bg-(--ui-hover) aria-[current]:bg-(--ui-hover) aria-[current]:font-medium">
                {p.title}
              </a>
            ))}
          </div>
        ))}
      </nav>

      <main className="mx-auto w-full max-w-4xl min-w-0 px-4 py-6 md:px-8">
        <div className="mb-4 flex justify-end gap-2">
          <ThemeToggle size="sm" />
        </div>
        {page ? <ComponentPage key={page.slug} page={page} /> : <Overview />}
      </main>
      <Toaster />
    </div>
  )
}

function ComponentPage({ page }: { page: Page & { group: Group } }) {
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
