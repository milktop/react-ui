/* Searchable
  `searchable` turns it into an input that filters the list (labels starting with the text first). With `multiple`, the picks show as tags. */
import { useState } from 'react'
import { Select } from '@milktop/react-ui'

const students = [
  { id: 1, name: 'Ada Lovelace' }, { id: 2, name: 'Alan Turing' }, { id: 3, name: 'Grace Hopper' },
  { id: 4, name: 'Katherine Johnson' }, { id: 5, name: 'Tim Berners-Lee' },
]
const subjects = ['Biology', 'Chemistry', 'English', 'French', 'Geography', 'History', 'Maths', 'Physics']

export default function Example() {
  const [studentId, setStudentId] = useState<number | null>(null)
  const [picked, setPicked] = useState(['Maths'])
  return <>
    <Select label="Student" items={students} labelKey="name" valueKey="id" searchable clearable value={studentId} onValueChange={setStudentId} />
    <Select label="Subjects" items={subjects} searchable multiple hideSelected variant="accent" value={picked} onValueChange={setPicked}
      placeholder="Add a subject…" />
    <p>{studentId ?? '—'}, {JSON.stringify(picked)}</p>
  </>
}
