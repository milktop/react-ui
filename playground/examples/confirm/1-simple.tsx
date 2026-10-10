/* Ask, then act
  `confirm()` returns a promise of true or false, so the code reads in order: no open state, no dialog in your markup. */
import { useState } from 'react'
import { confirm, Button } from '@milktop/react-ui'

export default function Example() {
  const [archived, setArchived] = useState(false)
  async function archive() {
    if (await confirm({ heading: 'Archive Ada Lovelace?', description: 'She’ll leave your lists; you can bring her back.', confirmLabel: 'Archive' })) {
      setArchived(true)
    }
  }
  return <>
    <Button icon="lucide:archive" onClick={archive} disabled={archived}>{archived ? 'Archived' : 'Archive student'}</Button>
    {archived && <Button variant="link" onClick={() => setArchived(false)}>Undo</Button>}
  </>
}
