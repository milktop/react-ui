/* Loading, then updated
  `toaster.create({ type: 'loading', … })` returns an id (as `toaster.loading` does, though Zag types that one void); `toaster.update(id, …)` turns it into a success. */
import { toaster, Button } from '@milktop/react-ui'

function upload() {
  const id = toaster.create({ type: 'loading', title: 'Uploading worksheet…' })
  setTimeout(() => toaster.update(id, { type: 'success', title: 'Worksheet uploaded', description: 'fractions.pdf, 240 KB' }), 1500)
}

export default function Example() {
  return <Button icon="lucide:upload" onClick={upload}>Upload worksheet</Button>
}
