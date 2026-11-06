/* In a popover
  Measured once it shows, so it opens at its `rows`, not flat. */
import { useState } from 'react'
import { Button, Popover, Textarea } from '@milktop/react-ui'

export default function Example() {
  const [note, setNote] = useState('')
  return (
    <Popover heading="Commentaire" trigger={<Button>Ajouter un commentaire</Button>}>
      <Textarea value={note} onValueChange={setNote} rows={2} maxRows={5} placeholder="Pour Moka, renouvellement…" />
    </Popover>
  )
}
