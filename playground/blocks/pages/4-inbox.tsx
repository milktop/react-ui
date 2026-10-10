/* Inbox
  Conversations on the left (search, unread counts), the thread on the right, and a rich text reply that adds to it. On phones the list and thread take turns. */
import { useState } from 'react'
import { Avatar, Badge, Button, Editor, Input, Card, EmptyState, cx } from '@milktop/react-ui'

type Message = { from: 'them' | 'me', html: string, time: string }
type Thread = { id: number, name: string, role: string, unread: number, messages: Message[] }

const initial: Thread[] = [
  { id: 1, name: 'Anne Byron', role: 'Ada’s parent', unread: 0, messages: [
    { from: 'them', html: '<p>Hi Grace, could Ada move to 17:00 next Thursday?</p>', time: '09:12' },
    { from: 'them', html: '<p>She has a <strong>netball match</strong> until 16:30.</p>', time: '09:13' },
  ] },
  { id: 2, name: 'Alan Turing', role: 'Student', unread: 0, messages: [
    { from: 'me', html: '<p>Great work on the mock today. Worksheet 5 is attached.</p>', time: 'Mon' },
    { from: 'them', html: '<p>Thanks! I’ll do it by Friday.</p>', time: 'Mon' },
  ] },
  { id: 3, name: 'Grace Hopper', role: 'Student', unread: 1, messages: [
    { from: 'them', html: '<p>Is there a lesson over half term?</p>', time: 'Sun' },
  ] },
]

const last = (thread: Thread) => thread.messages[thread.messages.length - 1]
const text = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

export default function Inbox() {
  const [threads, setThreads] = useState(initial)
  const [openId, setOpenId] = useState<number | null>(1)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const open = threads.find((t) => t.id === openId) ?? null
  const shown = threads.filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase()))

  function select(id: number) {
    setOpenId(id)
    setThreads(threads.map((t) => (t.id === id ? { ...t, unread: 0 } : t)))
  }

  function send() {
    if (!open || !text(draft)) return
    setThreads(threads.map((t) => (t.id === open.id ? { ...t, messages: [...t.messages, { from: 'me', html: draft, time: 'Now' }] } : t)))
    setDraft('')
  }

  return (
    <Card flush className="overflow-hidden">
      <div className="grid min-h-[34rem] md:grid-cols-[18rem_1fr]">
        <aside className={cx('flex-col border-(--ui-border) md:flex md:border-r', open ? 'hidden' : 'flex')}>
          <div className="border-b border-(--ui-border) p-3">
            <Input icon="lucide:search" placeholder="Search messages" value={query} onValueChange={setQuery} size="sm" />
          </div>
          <ul className="m-0 flex-1 list-none overflow-y-auto p-1.5">
            {shown.map((thread) => (
              <li key={thread.id}>
                <button type="button" onClick={() => select(thread.id)} aria-current={thread.id === openId || undefined}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-(--ui-radius) border-0 bg-transparent p-2.5 text-left text-(--ui-text) hover:bg-(--ui-hover) aria-[current]:bg-(--ui-hover)">
                  <Avatar size="sm" name={thread.name} color="auto" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={cx('truncate text-sm', thread.unread ? 'font-semibold' : 'font-medium')}>{thread.name}</span>
                      <span className="ml-auto shrink-0 text-xs text-(--ui-muted)">{last(thread).time}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="truncate text-xs text-(--ui-muted)">{text(last(thread).html)}</span>
                      {thread.unread > 0 && <Badge variant="accent" className="ml-auto shrink-0">{thread.unread}</Badge>}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {open ? (
          <section className="flex min-w-0 flex-col">
            <header className="flex items-center gap-3 border-b border-(--ui-border) px-4 py-3">
              <Button size="sm" variant="ghost" icon="lucide:arrow-left" aria-label="Back" className="md:hidden" onClick={() => setOpenId(null)} />
              <Avatar size="sm" name={open.name} color="auto" />
              <div className="min-w-0 flex-1"><div className="text-sm font-semibold">{open.name}</div><div className="text-xs text-(--ui-muted)">{open.role}</div></div>
              <Button size="sm" variant="ghost" icon="lucide:phone" aria-label="Call" />
            </header>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              {open.messages.map((message, i) => (
                <div key={i} className={cx('flex max-w-[80%] flex-col gap-1', message.from === 'me' ? 'self-end items-end' : 'items-start')}>
                  <div className={cx('rounded-[calc(var(--ui-radius)+6px)] px-3.5 py-2 text-sm [&_p]:m-0',
                    message.from === 'me' ? 'bg-(--ui-accent) text-(--ui-accent-text)' : 'bg-(--ui-hover)')}
                    dangerouslySetInnerHTML={{ __html: message.html }} />
                  <span className="text-xs text-(--ui-muted)">{message.time}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 border-t border-(--ui-border) p-3">
              <Editor value={draft} onValueChange={setDraft} placeholder={`Reply to ${open.name}…`} minHeight="4rem" maxHeight="12rem"
                tools={['bold', 'italic', '|', 'bulletList', '|', 'link']} />
              <div className="flex justify-end"><Button variant="primary" icon="lucide:send" disabled={!text(draft)} onClick={send}>Send</Button></div>
            </div>
          </section>
        ) : (
          <div className="hidden items-center justify-center md:flex">
            <EmptyState icon="lucide:messages-square" heading="No conversation open" description="Pick one from the list." />
          </div>
        )}
      </div>
    </Card>
  )
}
