/* A form in a card
  Fields on the grid with a footer of actions, errors shown where they belong. */
import { useState, type FormEvent } from 'react'
import { Card, Fields, Field, Input, Select, DatePicker, Textarea, Button, toaster } from '@milktop/react-ui'
import { students } from '../../data'

export default function CardForm() {
  const [student, setStudent] = useState<number | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  function submit(e: FormEvent) {
    e.preventDefault()
    setError(student ? null : 'Pick a student')
    if (student) toaster.success({ title: 'Lesson booked' })
  }
  return (
    <form onSubmit={submit} noValidate>
      <Card heading="Book a lesson" description="They'll get an email with the details."
        footer={<div className="flex justify-end gap-2"><Button type="reset">Cancel</Button><Button type="submit" variant="primary">Book</Button></div>}>
        <Fields>
          <Field label="Student" error={error} required span={6}>
            <Select items={students} labelKey="name" valueKey="id" searchable value={student} onValueChange={setStudent} />
          </Field>
          <Field label="Date" span={6}><DatePicker value={date} onValueChange={setDate} /></Field>
          <Field label="Topic" span={12}><Input placeholder="e.g. Simultaneous equations" /></Field>
          <Field label="Notes" span={12}><Textarea rows={2} /></Field>
        </Fields>
      </Card>
    </form>
  )
}
