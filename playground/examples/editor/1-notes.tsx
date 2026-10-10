/* Notes
  Its value is HTML, like the other controls' values; the usual shortcuts work (⌘B, ⌘I, ⌘U…). */
import { useState } from 'react'
import { Editor } from '@milktop/react-ui'

export default function Example() {
  const [notes, setNotes] = useState('<h2>Fractions and decimals</h2><p>Recap <strong>equivalent fractions</strong>, then convert between fractions and decimals.</p><ul><li><p>Halves, quarters and tenths</p></li><li><p>Ordering a mixed list</p></li></ul>')
  return <>
    <Editor value={notes} onValueChange={setNotes} placeholder="Lesson notes…" />
    <p className="m-0 w-full text-xs break-all text-(--ui-muted)">{notes}</p>
  </>
}
