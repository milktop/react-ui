/* Line
  With no value the first enabled tab is selected. */
import { useState } from 'react'
import { Tabs, Button } from '@milktop/react-ui'

export default function Example() {
  const [tab, setTab] = useState<string | number | null>(null)
  return <>
    <Tabs value={tab} onValueChange={setTab}>
      <Tabs.Tab value="lessons" label="Lessons" icon="lucide:calendar">Upcoming lessons: Maths with Ada on Thursday, Physics with Alan on Friday.</Tabs.Tab>
      <Tabs.Tab value="students" label="Students" icon="lucide:users">12 active students, 3 waiting for a first lesson.</Tabs.Tab>
      <Tabs.Tab value="invoices" label="Invoices" icon="lucide:receipt">2 invoices are due this week.</Tabs.Tab>
      <Tabs.Tab value="reports" label="Reports" disabled>Coming soon.</Tabs.Tab>
    </Tabs>
    <p className="m-0 flex w-full items-center gap-3 text-sm text-(--ui-muted)">tab: {JSON.stringify(tab)}
      <Button size="sm" onClick={() => setTab('invoices')}>Invoices</Button></p>
  </>
}
