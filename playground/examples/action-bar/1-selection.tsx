/* With a selection
  Tick some lessons. It isn’t modal, so you can keep selecting; Escape inside it or its close button closes it. */
import { useState } from 'react'
import { ActionBar, Button, CheckboxGroup } from '@milktop/react-ui'

const lessons = [
  { value: 1, label: 'Thu 8 Oct, Maths with Ada' },
  { value: 2, label: 'Fri 9 Oct, English with Alan' },
  { value: 3, label: 'Mon 12 Oct, Physics with Grace' },
  { value: 4, label: 'Tue 13 Oct, Maths with Katherine' },
]

export default function Example() {
  const [picked, setPicked] = useState<number[]>([])
  const [done, setDone] = useState('')
  const act = (verb: string) => { setDone(`${verb} ${picked.length} lessons`); setPicked([]) }
  return <>
    <CheckboxGroup label="Upcoming lessons" items={lessons} selectAll="All lessons" value={picked} onValueChange={setPicked} />
    <ActionBar open={picked.length > 0} onClose={() => setPicked([])} selection={`${picked.length} selected`}>
      <Button size="sm" icon="lucide:calendar-clock" onClick={() => act('Rescheduled')}>Reschedule</Button>
      <Button size="sm" variant="danger" icon="lucide:calendar-x" onClick={() => act('Cancelled')}>Cancel</Button>
    </ActionBar>
    <p className="m-0 w-full text-sm text-(--ui-muted)">picked: {JSON.stringify(picked)} {done}</p>
  </>
}
