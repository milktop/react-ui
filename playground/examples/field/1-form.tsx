/* A form
  Fields on a 12-column grid. Controls inside a Field use its label, hint and error. Submit with nothing picked to see the errors. */
import { useState, type FormEvent } from 'react'
import { Fields, Field, Select, DatePicker, NumberInput, Textarea, RadioGroup, Checkbox, Button } from '@milktop/react-ui'

const students = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Alan Turing' },
]

type Lesson = {
  student: number | null, date: string | null, duration: number | null, where: string | null, notes: string, reminder: boolean
}
type Errors = Partial<Record<keyof Lesson, string | null>>

export default function Example() {
  const [form, setForm] = useState<Lesson>({ student: null, date: null, duration: 60, where: 'home', notes: '', reminder: true })
  const [errors, setErrors] = useState<Errors>({})
  const [saved, setSaved] = useState<Lesson | null>(null)
  const set = <K extends keyof Lesson>(key: K) => (value: Lesson[K]) => setForm({ ...form, [key]: value })

  function save(e: FormEvent) {
    e.preventDefault()
    const next: Errors = {
      student: form.student ? null : 'Pick a student',
      date: form.date ? null : 'Pick a date',
    }
    setErrors(next)
    setSaved(next.student || next.date ? null : form)
  }

  return (
    <form onSubmit={save} noValidate className="flex w-full max-w-2xl flex-col gap-5">
      <Fields legend="New lesson" description="Book a lesson with one of your students.">
        <Field label="Student" error={errors.student} required span={6}>
          <Select items={students} labelKey="name" valueKey="id" value={form.student} onValueChange={set('student')} />
        </Field>
        <Field label="Date" error={errors.date} required span={6}>
          <DatePicker value={form.date} onValueChange={set('date')} />
        </Field>
        <Field label="Duration" hint="Most lessons are 60 minutes" span={6}>
          <NumberInput value={form.duration} onValueChange={set('duration')} min={15} step={15} suffix="min" />
        </Field>
        <Field label="Where" span={6}>
          <RadioGroup orientation="horizontal" value={form.where} onValueChange={set('where')}
            items={[{ value: 'home', label: 'At home' }, { value: 'video', label: 'On video' }]} />
        </Field>
        <Field label="Notes" span={12}>
          <Textarea placeholder="Anything to prepare?" value={form.notes} onValueChange={set('notes')} rows={2} />
        </Field>
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
