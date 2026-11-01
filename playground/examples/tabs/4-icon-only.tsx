/* Icon only
  Too many tabs to fit by name: each shows its icon, its label in a tooltip. */
import { useState } from 'react'
import { Tabs } from '@milktop/react-ui'

export default function Example() {
  const [tab, setTab] = useState<string | number | null>('profile')
  return (
    <Tabs iconOnly counts="corner" value={tab} onValueChange={setTab}>
      <Tabs.Tab value="profile" label="Profile" icon="lucide:contact">Ada Lovelace, year 11.</Tabs.Tab>
      <Tabs.Tab value="lessons" label="Lessons" icon="lucide:calendar" count={4}>Four lessons booked.</Tabs.Tab>
      <Tabs.Tab value="invoices" label="Invoices" icon="lucide:receipt" dot countColor="danger" countLabel="overdue">One invoice overdue.</Tabs.Tab>
      <Tabs.Tab value="files" label="Files" icon="lucide:paperclip">No files yet.</Tabs.Tab>
      <Tabs.Tab value="notes" label="Notes" icon="lucide:notebook-pen">Prefers worked examples.</Tabs.Tab>
    </Tabs>
  )
}
