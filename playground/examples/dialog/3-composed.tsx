/* Composed
  Between the props and building it by hand: Header, Body and Footer as children, with the backdrop, positioning and close button still done for you. A `Dialog.Trigger` child opens it; `Dialog.Header` takes `heading` and `description` (or anything else as children). */
import { useState } from 'react'
import { Dialog, Button } from '@milktop/react-ui'

const tag = 'rounded bg-(--ui-hover) px-1.5 py-0.5 text-xs font-medium'

export default function Example() {
  const [archived, setArchived] = useState(false)
  return <>
    <Dialog size="lg">
      <Dialog.Trigger asChild><Button icon="lucide:file-text">Lesson notes</Button></Dialog.Trigger>
      <Dialog.Header heading="Quadratics" description="Thursday 9 October, with Ada Lovelace">
        <div className="mt-3 flex gap-2"><span className={tag}>GCSE</span><span className={tag}>Maths</span></div>
      </Dialog.Header>
      <Dialog.Body className="space-y-2">
        <p>Worked through past paper 2, questions 1–6. Factorising is solid; completing the square needs another go.</p>
        <p>Homework: exercise 4B, and bring a calculator next time.</p>
      </Dialog.Body>
      <Dialog.Footer>
        <Button variant="ghost" className="mr-auto" onClick={() => setArchived(true)}>Archive</Button>
        <Dialog.CloseTrigger asChild><Button>Close</Button></Dialog.CloseTrigger>
        <Dialog.CloseTrigger asChild><Button variant="primary">Done</Button></Dialog.CloseTrigger>
      </Dialog.Footer>
    </Dialog>
    {archived && <p className="m-0 w-full text-sm text-(--ui-muted)">Archived.</p>}
  </>
}
