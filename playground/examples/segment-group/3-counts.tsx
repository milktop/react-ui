/* Counts and dots
  Items take a badge on the corner, as on Button: `count` (hidden at 0, "99+" past `max`), or `dot`; `pulse` ripples it, `countColor` colours it. Screen readers hear it after the label ("Inbox, 4 new"). `renderItem` is there for anything else in an option. */
import { useState } from 'react'
import { Segmented } from '@milktop/react-ui'

export default function Example() {
  const [view, setView] = useState<string | null>('inbox')
  const [layout, setLayout] = useState<string | null>('list')
  return <>
    <Segmented label="Mail" value={view} onValueChange={setView} items={[
      { value: 'inbox', label: 'Inbox', count: 4 },
      { value: 'drafts', label: 'Drafts', dot: true, pulse: true },
      { value: 'sent', label: 'Sent', count: 120, countColor: 'neutral' },
    ]} />
    <Segmented label="Layout" iconOnly value={layout} onValueChange={setLayout} items={[
      { value: 'list', label: 'List', icon: 'lucide:list' },
      { value: 'board', label: 'Board', icon: 'lucide:kanban', dot: true, countColor: 'accent' },
      { value: 'calendar', label: 'Calendar', icon: 'lucide:calendar', count: 2, countColor: 'accent' },
    ]} />
    <p>{view}, {layout}</p>
  </>
}
