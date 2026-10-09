/* Form dialog
  `trigger` opens it; `footer` holds the buttons; `open` and `onOpenChange` control it. */
import { useState } from 'react'
import { Dialog, Button, Fields, Field } from '@milktop/react-ui'

export default function Example() {
  const [open, setOpen] = useState(false)
  const [student, setStudent] = useState({ name: 'Ada Lovelace', email: 'ada@example.com' })
  const [draft, setDraft] = useState(student)

  function openChange(next: boolean) {
    if (next) setDraft(student)
    setOpen(next)
  }
  function save() {
    setStudent(draft)
    setOpen(false)
  }

  return <>
    <Dialog heading="Edit student" description="Changes are saved to their profile." open={open} onOpenChange={openChange}
      trigger={<Button icon="lucide:pencil">Edit student</Button>}
      footer={<>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button variant="primary" onClick={save}>Save</Button>
      </>}>
      <Fields>
        <Field label="Name" value={draft.name} onValueChange={(name) => setDraft({ ...draft, name })} />
        <Field label="Email" type="email" value={draft.email} onValueChange={(email) => setDraft({ ...draft, email })} />
      </Fields>
    </Dialog>
    <p className="m-0 w-full text-sm text-(--ui-muted)">student: {JSON.stringify(student)}</p>
  </>
}
