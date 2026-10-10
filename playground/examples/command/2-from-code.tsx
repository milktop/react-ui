/* Opened from code
  No trigger: control `open`. */
import { useState } from 'react'
import { Command, Button } from '@milktop/react-ui'
import { actions } from './actions'

export default function Example() {
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<unknown>(null)
  return <>
    <Command items={actions} hotkey={null} open={open} onOpenChange={setOpen} onSelect={setPicked} />
    <Button onClick={() => setOpen(true)}>Open it</Button>
    <p className="m-0 w-full text-sm text-(--ui-muted)">{JSON.stringify({ open, picked })}</p>
  </>
}
