/* The whole layout: build it from parts
  When the shortcut's layout isn't what you need, its parts (Ark's own, styled by the same CSS) let you arrange it yourself and class any of them, here a blurred, tinted backdrop. */
import { Dialog, Button, Portal } from '@milktop/react-ui'

export default function Example() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild><Button>Open a custom dialog</Button></Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop className="bg-violet-950/40 backdrop-blur-sm" />
        <Dialog.Positioner>
          <Dialog.Content className="border-violet-300">
            <Dialog.Title>Built by hand</Dialog.Title>
            <Dialog.Description>Same CSS as the shortcut, with our own backdrop and border.</Dialog.Description>
            <div className="mt-4 flex justify-end"><Dialog.CloseTrigger asChild><Button>Close</Button></Dialog.CloseTrigger></div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
