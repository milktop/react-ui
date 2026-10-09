/* Several
  `multiple` picks several; `tags` shows them as tags in the box. */
import { useState } from 'react'
import { Select } from '@milktop/react-ui'

const subjects = ['Maths', 'Physics', 'Chemistry', 'Biology', 'English', 'History']

export default function Example() {
  const [picked, setPicked] = useState(['Maths'])
  return <>
    <Select label="Subjects" items={subjects} multiple value={picked} onValueChange={setPicked} />
    <Select label="Subjects (tags)" items={subjects} multiple tags variant="accent" value={picked} onValueChange={setPicked} />
    <p>{picked.join(', ') || '—'}</p>
  </>
}
