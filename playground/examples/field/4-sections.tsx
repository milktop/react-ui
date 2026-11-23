/* Sections
  Fields that follow one another are one form's sections: each legend becomes a small label on a rule. */
import { Fields, Field, Input, Select, Switch } from '@milktop/react-ui'

const roles = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'assistant', label: 'Assistant' },
]

export default function Example() {
  return (
    <form className="flex w-full max-w-2xl flex-col gap-8">
      <Fields legend="Profile">
        <Field label="Name" span={6}><Input /></Field>
        <Field label="Email" span={6}><Input type="email" /></Field>
      </Fields>
      <Fields legend="Role">
        <Field label="Role" span={6}><Select items={roles} value="teacher" /></Field>
        <Field span={12}><Switch label="Can edit the timetable" /></Field>
      </Fields>
      <Fields legend="Notifications" description="Sent by email">
        <Field span={12}><Switch label="A lesson is booked" defaultChecked /></Field>
        <Field span={12}><Switch label="A lesson is cancelled" /></Field>
      </Fields>
    </form>
  )
}
