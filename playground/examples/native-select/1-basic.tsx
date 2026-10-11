/* Native select
  The browser's own select (the phone's own picker), styled like the other inputs; `group` sorts items under headings. */
import { useState } from 'react'
import { NativeSelect, Field } from '@milktop/react-ui'

const species = [
  { value: 'dog', label: 'Dog', group: 'Mammals' }, { value: 'cat', label: 'Cat', group: 'Mammals' }, { value: 'rabbit', label: 'Rabbit', group: 'Mammals' },
  { value: 'parrot', label: 'Parrot', group: 'Birds' }, { value: 'tortoise', label: 'Tortoise', group: 'Reptiles' },
]

export default function Example() {
  const [value, setValue] = useState<string | null>(null)
  return <>
    <NativeSelect label="Species" items={species} placeholder="Choose…" value={value} onValueChange={setValue} />
    <Field label="Size" hint="In a Field">
      <NativeSelect items={['Small', 'Medium', 'Large']} defaultValue="Medium" />
    </Field>
    <p>value: {JSON.stringify(value)}</p>
  </>
}
