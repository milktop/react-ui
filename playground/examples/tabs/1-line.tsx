/* Line
  With no value the first enabled tab is selected. */
import { useState } from 'react'
import { Tabs, Tab, Button } from '@milktop/react-ui'

export default function Example() {
  const [tab, setTab] = useState<string | number | null>(null)
  return <>
    <Tabs value={tab} onValueChange={setTab}>
      <Tab value="lessons" label="Lessons" icon="lucide:calendar">Upcoming lessons: Maths with Ada on Thursday, Physics with Alan on Friday.</Tab>
      <Tab value="students" label="Students" icon="lucide:users">12 active students, 3 waiting for a first lesson.</Tab>
      <Tab value="invoices" label="Invoices" icon="lucide:receipt">2 invoices are due this week.</Tab>
      <Tab value="reports" label="Reports" disabled>Coming soon.</Tab>
    </Tabs>
    <p className="m-0 flex w-full items-center gap-3 text-sm text-(--ui-muted)">tab: {JSON.stringify(tab)}
      <Button size="sm" onClick={() => setTab('invoices')}>Invoices</Button></p>
  </>
}
