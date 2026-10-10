// A block's page: a sections block's variants, each framed like a window, or
// a page block alone, filling the main area as it would in an app, with a
// floating switch to its code.
import { useState, type ReactNode } from 'react'
import { Segmented, CopyButton } from '@milktop/react-ui'
import type { Block } from '../blocks/registry'

const views = [{ value: 'preview', label: 'Preview' }, { value: 'code', label: 'Code' }]
const codeClass = 'm-0 overflow-auto bg-(--ui-surface) p-5 text-xs leading-relaxed [tab-size:2]'

// Both views stay rendered (one hidden), so the block keeps its state.
function Frame({ caption, code, children }: { caption: string, code: string, children: ReactNode }) {
  const [view, setView] = useState('preview')
  return (
    <div className="overflow-hidden rounded-[calc(var(--ui-radius)+6px)] border border-(--ui-border) bg-(--ui-canvas)">
      <div className="flex items-center justify-between gap-4 border-b border-(--ui-border) bg-(--ui-surface) py-2 pr-2 pl-4">
        <span className="min-w-0 truncate text-sm text-(--ui-muted)">{caption}</span>
        <div className="flex shrink-0 items-center gap-2">
          {view === 'code' && <CopyButton value={code} />}
          <Segmented size="sm" items={views} value={view} onValueChange={(v) => v && setView(v)} />
        </div>
      </div>
      <div className="p-4 md:p-8" hidden={view !== 'preview'}>{children}</div>
      <pre className={`${codeClass} max-h-[70vh]`} hidden={view !== 'code'}><code>{code}</code></pre>
    </div>
  )
}

export function BlockPage({ block }: { block: Block }) {
  const [view, setView] = useState('preview')
  if (block.kind === 'sections') return <>
    <h1 className="m-0 text-xl font-bold">{block.title}</h1>
    <p className="mt-1 mb-6 text-sm text-(--ui-muted)">{block.about}</p>
    {block.examples.map(({ path, title, description, code, Component }) => (
      <div key={path} className="mb-8"><Frame caption={description || title} code={code}><Component /></Frame></div>
    ))}
  </>

  const { Component, code } = block.page
  return <>
    <div hidden={view !== 'preview'}><Component /></div>
    <pre className={`${codeClass} rounded-[calc(var(--ui-radius)+6px)] border border-(--ui-border)`} hidden={view !== 'code'}><code>{code}</code></pre>
    <div className="fixed right-4 bottom-4 z-40 flex items-center gap-1 rounded-[calc(var(--ui-radius)+6px)] border border-(--ui-border) bg-(--ui-surface) p-1 shadow-(--ui-shadow)">
      {view === 'code' && <CopyButton value={code} />}
      <Segmented size="sm" items={views} value={view} onValueChange={(v) => v && setView(v)} aria-label={`${block.title}: preview or code`} />
    </div>
  </>
}
