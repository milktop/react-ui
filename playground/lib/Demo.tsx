// One example: its title and Code toggle on the canvas, the example in a
// card below. `form`: lay it out on a two-column grid (inputs, pickers, choices).
import { useState, type ComponentProps } from 'react'
import 'iconify-icon'
import { cx } from '@milktop/react-ui'
import type { Example } from '../registry'

export function Demo({ example, form = false }: { example: Example, form?: boolean }) {
  const [showCode, setShowCode] = useState(false)
  const { Component } = example

  return (
    <section className="flex flex-col gap-3 py-5">
      <header className="flex items-center justify-between gap-4">
        <h2 className="m-0 text-base font-semibold">{example.title}</h2>
        <Toggle pressed={showCode} onClick={() => setShowCode(!showCode)} icon="lucide:code">Code</Toggle>
      </header>
      {example.description && <p className="-mt-1 mb-0 text-sm text-(--ui-muted)"><Backticked text={example.description} /></p>}
      {showCode && (
        <pre className="m-0 overflow-x-auto rounded-[calc(var(--ui-radius)+6px)] border border-(--ui-border) bg-(--ui-surface) p-4 text-xs leading-relaxed [tab-size:2]">
          <code>{example.code}</code>
        </pre>
      )}
      {example.bare
        ? <div className="flex w-full flex-wrap items-start gap-3"><Component /></div>
        : (
          <div className={cx('box-border w-full rounded-[calc(var(--ui-radius)+6px)] border border-(--ui-border) bg-(--ui-surface) p-5 shadow-(--ui-card-shadow) md:p-6',
            form ? 'grid grid-cols-1 items-start gap-x-6 gap-y-5 sm:grid-cols-2 [&>*]:min-w-0 [&>p]:col-span-full [&>p]:m-0 [&>p]:text-sm [&>p]:text-(--ui-muted)' : 'flex flex-wrap items-start gap-3')}>
            <Component />
          </div>
        )}
    </section>
  )
}

// `backticked` words show as code.
export const Backticked = ({ text }: { text: string }) => text.split('`').map((piece, i) =>
  i % 2 ? <code key={i} className="rounded bg-(--ui-hover) px-1 text-xs text-(--ui-text)">{piece}</code> : piece)

export const Toggle = ({ pressed, icon, children, ...rest }: ComponentProps<'button'> & { pressed: boolean, icon: string }) => (
  <button type="button" aria-pressed={pressed} {...rest}
    className="inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-transparent bg-transparent px-2 text-xs text-(--ui-muted) hover:bg-(--ui-hover) hover:text-(--ui-text) aria-pressed:border-(--ui-border) aria-pressed:bg-(--ui-surface) aria-pressed:text-(--ui-text)">
    <iconify-icon icon={icon} />{children}
  </button>
)
