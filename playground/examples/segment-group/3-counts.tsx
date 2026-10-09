/* Counts and dots
  `renderItem` draws each option's content, given the item and whether it's picked: a count or a dot beside the label here. */
import { useState } from 'react'
import { Segmented, cx } from '@milktop/react-ui'

const views = [
  { value: 'inbox', label: 'Inbox', count: 4 },
  { value: 'drafts', label: 'Drafts', count: 0, dot: true },
  { value: 'sent', label: 'Sent', count: 12 },
]

export default function Example() {
  const [view, setView] = useState<string | null>('inbox')
  return <>
    <Segmented label="Mail" items={views} value={view} onValueChange={setView}
      renderItem={(item, { selected }) => <>
        {item.label}
        {item.count > 0 && (
          <span className={cx('ml-1.5 rounded-full px-1.5 text-[11px] leading-4 tabular-nums',
            selected ? 'bg-(--ui-accent) text-(--ui-accent-text)' : 'bg-(--ui-border) text-(--ui-muted)')}>{item.count}</span>
        )}
        {item.dot && <span className="ml-1.5 size-1.5 rounded-full bg-(--ui-danger)" aria-label="new" />}
      </>} />
    <p>{view}</p>
  </>
}
