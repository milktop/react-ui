/* With an action
  The action button runs its handler and dismisses the toast. */
import { toaster, Button } from '@milktop/react-ui'

function removed() {
  toaster.create({
    title: 'Lesson removed',
    description: 'It’s gone from the calendar.',
    action: { label: 'Undo', onClick: () => toaster.info({ title: 'Lesson restored' }) },
  })
}

export default function Example() {
  return <Button icon="lucide:undo-2" onClick={removed}>Remove lesson</Button>
}
