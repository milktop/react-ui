/* Beside the page
  With modal={false} the page stays usable: no backdrop, it still scrolls, and
  a click outside leaves the sheet open. */
import { useState } from 'react'
import { Sheet, Button } from '@milktop/react-ui'

const students = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper']

export default function Example() {
  const [student, setStudent] = useState<string | null>(null)
  return <>
    <div className="flex flex-wrap gap-2">
      {students.map((name) => <Button key={name} onClick={() => setStudent(name)}>{name}</Button>)}
    </div>
    <Sheet modal={false} size="sm" heading={student} description="Year 11 · Thursdays" open={!!student}
      onOpenChange={(open) => !open && setStudent(null)}>
      <p className="m-0">Pick another student on the page: the sheet follows.</p>
    </Sheet>
  </>
}
