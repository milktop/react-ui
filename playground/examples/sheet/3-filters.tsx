/* Filters, without a header */
import { useState } from 'react'
import { Sheet, Button, CheckboxGroup } from '@milktop/react-ui'

export default function Example() {
  const [open, setOpen] = useState(false)
  const [subjects, setSubjects] = useState(['maths'])
  return <>
    <Sheet side="right" size="sm" open={open} onOpenChange={setOpen} trigger={<Button icon="lucide:sliders-horizontal">Filters</Button>}
      footer={<Button variant="primary" onClick={() => setOpen(false)}>Show results</Button>}>
      <CheckboxGroup label="Subjects" value={subjects} onValueChange={setSubjects}
        items={[{ value: 'maths', label: 'Maths' }, { value: 'english', label: 'English' }, { value: 'science', label: 'Science' }]} />
    </Sheet>
    <p className="m-0 w-full text-sm text-(--ui-muted)">subjects: {JSON.stringify(subjects)}</p>
  </>
}
