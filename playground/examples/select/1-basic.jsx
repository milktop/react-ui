/* Strings and objects
  Plain strings, or objects with `labelKey` and `valueKey`; the value is the item's own (a number here). */
import { useState } from 'react'
import { Select } from '@milktop/react-ui'

const students = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Alan Turing' },
  { id: 3, name: 'Grace Hopper', disabled: true },
]

export default function Example() {
  const [level, setLevel] = useState(null)
  const [studentId, setStudentId] = useState(2)
  return <>
    <Select label="Level" items={['Key Stage 3', 'GCSE', 'A Level', 'IB']} value={level} onValueChange={setLevel} />
    <Select label="Student" items={students} labelKey="name" valueKey="id" value={studentId} onValueChange={setStudentId} clearable />
    <p>{level ?? '—'}, {String(studentId)} ({typeof studentId})</p>
  </>
}
