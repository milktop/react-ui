/* Confirm
  `alert` makes it an alertdialog: the backdrop doesn't close it. Uncontrolled, with Dialog.CloseTrigger on the buttons. */
import { Dialog, Button } from '@milktop/react-ui'

export default function Example() {
  return (
    <Dialog alert size="sm" heading="Delete lesson?" description="This cannot be undone." closable={false}
      trigger={<Button variant="danger" icon="lucide:trash-2">Delete</Button>}
      footer={<>
        <Dialog.CloseTrigger asChild><Button>Cancel</Button></Dialog.CloseTrigger>
        <Dialog.CloseTrigger asChild><Button variant="danger">Delete</Button></Dialog.CloseTrigger>
      </>} />
  )
}
