/* Pick one
  Items can be strings, or objects with a `description`; `orientation="horizontal"` puts them in a row. */
import { useState } from 'react'
import { RadioGroup } from '@milktop/react-ui'

const plans = [
  { value: 'payg', label: 'Pay as you go', description: 'Pay for each lesson' },
  { value: 'block', label: 'Block of 10', description: 'One free lesson' },
  { value: 'term', label: 'Termly', description: 'Billed each term', disabled: true },
]

export default function Example() {
  const [plan, setPlan] = useState<string | null>('payg')
  const [length, setLength] = useState<number | null>(60)
  return <>
    <RadioGroup label="Plan" items={plans} value={plan} onValueChange={setPlan} />
    <RadioGroup label="Length" orientation="horizontal" items={[{ value: 30, label: '30 min' }, { value: 60, label: '60 min' }]}
      value={length} onValueChange={setLength} />
    <p>{plan}, {length} ({typeof length})</p>
  </>
}
