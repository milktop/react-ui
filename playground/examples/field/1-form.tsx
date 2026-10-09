/* A form
  Fields on a 12-column grid. Controls inside a Field use its label, hint and error. Submit with nothing picked to see the errors. */
import { useState, type FormEvent } from 'react'
import { Fields, Field, Select, Checkbox, Button } from '@milktop/react-ui'

const students = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Alan Turing' },
]

type Lesson = { student: number | null, duration: number, notes: string, reminder: boolean }

export default function Example() {
  const [form, setForm] = useState<Lesson>({ student: null, duration: 60, notes: '', reminder: true })
  const [errors, setErrors] = useState<{ student?: string | null }>({})
  const [saved, setSaved] = useState<Lesson | null>(null)
  const set = <K extends keyof Lesson>(key: K) => (value: Lesson[K]) => setForm({ ...form, [key]: value })

  function save(e: FormEvent) {
    e.preventDefault()
    const next = { student: form.student ? null : 'Pick a student' }
    setErrors(next)
    setSaved(next.student ? null : form)
  }

  return (
    <form onSubmit={save} noValidate className="flex w-full max-w-2xl flex-col gap-5">
      <Fields legend="New lesson" description="Book a lesson with one of your students.">
        <Field label="Student" error={errors.student} required span={6}>
          <Select items={students} labelKey="name" valueKey="id" value={form.student} onValueChange={set('student')} />
        </Field>
        <Field label="Duration" type="number" suffix="min" value={form.duration} onValueChange={set('duration')}
          hint="Most lessons are 60 minutes" span={6} />
        <Field label="Notes" placeholder="Anything to prepare?" value={form.notes} onValueChange={set('notes')} />
        <Field span={12}>
          <Checkbox label="Remind them the day before" checked={form.reminder} onCheckedChange={set('reminder')} />
        </Field>
      </Fields>
      <div className="flex items-center gap-3">
        {saved && <span className="mr-auto text-sm text-(--ui-success)">Saved {JSON.stringify(saved)}</span>}
        <Button type="submit" variant="primary" className="ml-auto">Book lesson</Button>
      </div>
    </form>
  )
}
