/* Whole rows, spaced
  `handle={false}` lets the whole row be dragged (or focused and moved with the keyboard); `variant="plain"` spaces the rows apart. Strings are their own keys. */
import { useState } from 'react'
import { SortableList } from '@milktop/react-ui'

export default function Example() {
  const [subjects, setSubjects] = useState(['Maths', 'Physics', 'English', 'Chemistry'])
  return <>
    <SortableList items={subjects} onItemsChange={setSubjects} handle={false} variant="plain" label="Subjects by priority" className="w-64" />
    <p className="m-0 w-full text-sm text-(--ui-muted)">Priority: {subjects.join(', ')}</p>
  </>
}
