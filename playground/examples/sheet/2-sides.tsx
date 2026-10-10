/* Sides */
import { useState } from 'react'
import { Sheet, Button } from '@milktop/react-ui'

const sides = ['left', 'right', 'top', 'bottom'] as const

export default function Example() {
  const [open, setOpen] = useState(false)
  const [side, setSide] = useState<(typeof sides)[number]>('left')
  return <>
    {sides.map((value) => <Button key={value} className="capitalize" onClick={() => { setSide(value); setOpen(true) }}>{value}</Button>)}
    <Sheet side={side} size={side === 'left' ? 'sm' : 'md'} heading={`From the ${side}`} open={open} onOpenChange={setOpen}>
      <p className="m-0 text-(--ui-muted)">Left and right sheets are full height; top and bottom ones fit their content. `size` sets the width (or height): sm, md or lg.</p>
    </Sheet>
  </>
}
