/* Edit in place
  Reads as text until clicked; Enter or ✓ saves (calling `onValueChange`), Escape or ✕ cancels. */
import { useState } from 'react'
import { Editable, DataList } from '@milktop/react-ui'

export default function Example() {
  const [name, setName] = useState('Biscuit')
  const [notes, setNotes] = useState('')
  return (
    <DataList variant="divided" className="w-full max-w-md">
      <DataList.Item label="Name"><Editable value={name} onValueChange={setName} /></DataList.Item>
      <DataList.Item label="Notes"><Editable value={notes} onValueChange={setNotes} placeholder="Add a note…" /></DataList.Item>
      <DataList.Item label="Saved">{JSON.stringify({ name, notes })}</DataList.Item>
    </DataList>
  )
}
