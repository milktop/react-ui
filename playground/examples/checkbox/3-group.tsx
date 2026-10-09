/* A group, with select all and shift-click
  `selectAll` adds a parent that's indeterminate when only some are picked. Click one, then Shift-click another: everything between follows. */
import { useState } from 'react'
import { CheckboxGroup } from '@milktop/react-ui'

const lessons = ['Algebra', 'Geometry', 'Statistics', 'Calculus', 'Vectors', 'Matrices', 'Probability']

export default function Example() {
  const [picked, setPicked] = useState(['Geometry'])
  const [days, setDays] = useState(['Tue', 'Thu'])
  return <>
    <CheckboxGroup label="Lessons" items={lessons} value={picked} onValueChange={setPicked} selectAll="All lessons" />
    <CheckboxGroup label="Days" orientation="horizontal" value={days} onValueChange={setDays}
      items={[{ value: 'Mon', label: 'Mon' }, { value: 'Tue', label: 'Tue' }, { value: 'Wed', label: 'Wed' }, { value: 'Thu', label: 'Thu' },
        { value: 'Fri', label: 'Fri (full)', disabled: true }]} />
    <p>{picked.length} lessons, {JSON.stringify(days)}</p>
  </>
}
