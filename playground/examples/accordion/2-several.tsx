/* Several open
  `multiple`: the value is an array. */
import { useState } from 'react'
import { Accordion, Button } from '@milktop/react-ui'

export default function Example() {
  const [open, setOpen] = useState<string | string[] | null>(['notes'])
  return <>
    <Accordion multiple value={open} onValueChange={setOpen}>
      <Accordion.Item value="notes" heading="Lesson notes">Covered fractions and decimals; homework is worksheet 4.</Accordion.Item>
      <Accordion.Item value="goals" heading="Goals">Grade 7 in the summer exam.</Accordion.Item>
      <Accordion.Item value="contact" heading="Parent contact">Grace Hopper, grace@example.com</Accordion.Item>
    </Accordion>
    <p className="m-0 flex w-full items-center gap-3 text-sm text-(--ui-muted)">open: {JSON.stringify(open)}
      <Button size="sm" onClick={() => setOpen(['notes', 'goals', 'contact'])}>Open all</Button>
      <Button size="sm" onClick={() => setOpen([])}>Close all</Button>
    </p>
  </>
}
