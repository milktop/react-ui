/* Times
  'HH:mm', with `step` in minutes (the arrow keys move by it) and `min`/`max`; on phones, the system's wheel. */
import { useState } from 'react'
import { TimeInput, Field } from '@milktop/react-ui'

export default function Example() {
  const [start, setStart] = useState<string | null>('09:30')
  return <>
    <TimeInput label="Starts" value={start} onValueChange={setStart} step={15} min="08:00" max="18:00" />
    <Field label="Ends" hint="Quarter hours"><TimeInput step={15} /></Field>
    <p>start: {JSON.stringify(start)}</p>
  </>
}
