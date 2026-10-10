/* Edit form
  The body scrolls; the header and footer stay put. */
import { useState } from 'react'
import { Sheet, Button, Fields, Field, Textarea } from '@milktop/react-ui'

const lessons = [
  { date: 'Thu 8 Oct', topic: 'Fractions and decimals' },
  { date: 'Thu 1 Oct', topic: 'Ratio and proportion' },
  { date: 'Thu 24 Sep', topic: 'Percentages' },
  { date: 'Thu 17 Sep', topic: 'Negative numbers' },
  { date: 'Thu 10 Sep', topic: 'Place value' },
]

export default function Example() {
  const [editing, setEditing] = useState(false)
  const [student, setStudent] = useState({ name: 'Ada Lovelace', email: 'ada@example.com', year: 11, notes: 'Prefers worked examples.' })
  const [draft, setDraft] = useState(student)
  const set = <K extends keyof typeof draft>(key: K) => (value: (typeof draft)[K]) => setDraft({ ...draft, [key]: value })

  function openChange(open: boolean) {
    if (open) setDraft(student)
    setEditing(open)
  }

  return <>
    <Sheet heading="Edit student" description="Changes are saved to their profile." open={editing} onOpenChange={openChange}
      trigger={<Button icon="lucide:pencil">Edit student</Button>}
      footer={<>
        <Button onClick={() => setEditing(false)}>Cancel</Button>
        <Button variant="primary" onClick={() => { setStudent(draft); setEditing(false) }}>Save</Button>
      </>}>
      <Fields>
        <Field label="Name" value={draft.name} onValueChange={set('name')} />
        <Field span={8} label="Email" type="email" value={draft.email} onValueChange={set('email')} />
        <Field span={4} label="Year" type="number" min={7} max={13} value={draft.year} onValueChange={set('year')} />
        <Field label="Notes"><Textarea value={draft.notes} onValueChange={set('notes')} /></Field>
      </Fields>
      <h3 className="mt-8 mb-3 text-sm font-semibold">Recent lessons</h3>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {lessons.map((lesson) => (
          <li key={lesson.date} className="flex justify-between gap-4 border-b border-(--ui-border) pb-3">{lesson.topic}<span className="text-(--ui-muted)">{lesson.date}</span></li>
        ))}
      </ul>
    </Sheet>
    <p className="m-0 w-full text-sm text-(--ui-muted)">student: {JSON.stringify(student)}</p>
  </>
}
