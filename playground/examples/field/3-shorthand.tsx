/* Without children
  A Field with no children renders an Input, and passes it the other props (value, onValueChange, type, placeholder, icon, suffix…). Give it children for any other control. */
import { useState } from 'react'
import { Field } from '@milktop/react-ui'

export default function Example() {
  const [name, setName] = useState('')
  const [rate, setRate] = useState(40)
  return (
    <div className="grid w-full max-w-2xl grid-cols-2 gap-4">
      <Field label="Name" placeholder="Ada Lovelace" value={name} onValueChange={setName} hint="As it appears on invoices" required />
      <Field label="Rate" type="number" prefix="£" suffix="per hour" value={rate} onValueChange={setRate} />
      <p className="col-span-2 m-0 text-sm text-(--ui-muted)">{name || '—'}, {rate} ({typeof rate})</p>
    </div>
  )
}
