/* In a dialog
  `autoFocus` puts the cursor in it as the dialog opens, ready to type and press Enter. */
import { useState } from 'react'
import { Button, Dialog, NumberInput } from '@milktop/react-ui'

export default function Example() {
  const [weight, setWeight] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  return <>
    <Dialog open={open} onOpenChange={setOpen} heading="Weight" trigger={<Button>Add a weight</Button>}>
      <form onSubmit={(event) => { event.preventDefault(); setOpen(false) }}>
        <NumberInput label="Weight" value={weight} onValueChange={setWeight} min={0} steppers={false} suffix="kg" autoFocus />
      </form>
    </Dialog>
    <p>{weight}</p>
  </>
}
