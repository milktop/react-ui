/* Types
  Call `toaster.success(…)`, `.error`, `.warning`, `.info` or `.loading` from anywhere; one `<Toaster />` in the layout shows them. */
import { toaster, Button } from '@milktop/react-ui'

export default function Example() {
  return <>
    <Button icon="lucide:check" onClick={() => toaster.success({ title: 'Lesson booked', description: 'Maths with Ada, Thursday at 16:00' })}>Success</Button>
    <Button icon="lucide:circle-x" onClick={() => toaster.error({ title: 'Could not save', description: 'Check your connection and try again.' })}>Error</Button>
    <Button icon="lucide:triangle-alert" onClick={() => toaster.warning({ title: 'Lesson overlaps', description: 'Ada has another lesson at 16:30.' })}>Warning</Button>
    <Button icon="lucide:info" onClick={() => toaster.info({ title: 'New message', description: 'Grace replied about Thursday.' })}>Info</Button>
  </>
}
