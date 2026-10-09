/* By hand
  Ark's parts with Portal, plus Header, Body and Footer for the layout. They pick up the same styles and animations, and take classes like any element: a tinted, blurred backdrop here. */
import { Dialog, Portal, Button } from '@milktop/react-ui'

export default function Example() {
  return (
    <Dialog.Root lazyMount unmountOnExit>
      <Dialog.Trigger asChild><Button variant="soft">Open by hand</Button></Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop className="bg-indigo-950/40 backdrop-blur-sm" />
        <Dialog.Positioner>
          <Dialog.Content data-size="lg">
            <Dialog.Header>
              <Dialog.Title>Built from parts</Dialog.Title>
              <Dialog.Description>Every part of the shortcut, arranged yourself.</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <Dialog.Context>{(api) => <p className="m-0">Open: {String(api.open)}</p>}</Dialog.Context>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.CloseTrigger asChild><Button>Done</Button></Dialog.CloseTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
