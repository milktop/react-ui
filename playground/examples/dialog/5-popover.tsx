/* A popover inside
  A popover opened from a dialog shows on top of it, and its select's list too. */
import { useState } from 'react'
import { Dialog, Button, Field, Popover, Select } from '@milktop/react-ui'

const levels = [{ value: 'beginner', label: 'Beginner' }, { value: 'advanced', label: 'Advanced' }]

export default function Example() {
  const [level, setLevel] = useState('beginner')
  return (
    <Dialog heading="Today" size="lg" trigger={<Button icon="lucide:calendar">Today</Button>}>
      <div className="flex items-center gap-2">
        <span className="flex-1">Level: {level}</span>
        <Popover heading="Add a student" placement="bottom-end" className="flex flex-col gap-3"
          trigger={<Button size="sm" icon="lucide:user-plus" aria-label="Add a student" title="Add a student" />}>
          <Field label="Name" placeholder="Their name…" />
          <Field label="Level">
            <Select items={levels} value={level} onValueChange={(next) => setLevel(String(next))} />
          </Field>
        </Popover>
      </div>
    </Dialog>
  )
}
