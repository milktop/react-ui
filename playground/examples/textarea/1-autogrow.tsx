/* Growing with its content
  Starts at `rows` lines and grows up to `maxRows`, then scrolls; `autogrow={false}` gives a fixed, resizable box. */
import { useState } from 'react'
import { Textarea } from '@milktop/react-ui'

export default function Example() {
  const [notes, setNotes] = useState('Quadratics: past paper 2.\nBring a calculator.')
  return <>
    <Textarea label="Notes" value={notes} onValueChange={setNotes} rows={2} maxRows={6} />
    <Textarea label="Fixed" autogrow={false} rows={3} placeholder="Drag the corner" />
  </>
}
