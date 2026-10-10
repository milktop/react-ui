/* Announcement
  `dismissible` hides it (here `open` is controlled, so it can come back). */
import { useState } from 'react'
import { Banner, Button } from '@milktop/react-ui'

export default function Example() {
  const [open, setOpen] = useState(true)
  return <>
    <Banner icon="lucide:sparkles" dismissible open={open} onOpenChange={setOpen}>
      Lesson notes can now be shared with parents. <a href="#/banner">See how</a>
    </Banner>
    {!open && <Button size="sm" onClick={() => setOpen(true)}>Show it again</Button>}
  </>
}
