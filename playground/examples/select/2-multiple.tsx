/* Several, toggling and clearing
  `multiple` takes an array, with picks ticked in the list, or shown as `tags`; `hideSelected` takes them out of the list. `deselectable` lets a second click on the picked item clear it; `clearable` adds a clear button. Backspace on a closed multiple select removes the last pick. */
import { useState } from 'react'
import { Select } from '@milktop/react-ui'

export default function Example() {
  const [days, setDays] = useState(['Mon', 'Wed'])
  const [subjects, setSubjects] = useState(['Maths'])
  const [level, setLevel] = useState<string | null>('GCSE')
  const [room, setRoom] = useState<string | null>('Library')
  return <>
    <Select label="Days" multiple items={['Mon', 'Tue', 'Wed', 'Thu', 'Fri']} value={days} onValueChange={setDays} />
    <Select label="Subjects" multiple tags variant="accent" hideSelected items={['Maths', 'Physics', 'Chemistry', 'Biology']}
      value={subjects} onValueChange={setSubjects} />
    <Select label="Level" deselectable items={['GCSE', 'A Level', 'IB']} value={level} onValueChange={setLevel} />
    <Select label="Room" clearable items={['Library', 'Lab', 'Online']} value={room} onValueChange={setRoom} />
    <p>{JSON.stringify(days)}, {JSON.stringify(subjects)}, {level ?? '—'}, {room ?? '—'}</p>
  </>
}
