/* Limits, steps and formatting
  Arrow keys step too (Shift for 10); `formatOptions` formats it (currency here); `allowMouseWheel` steps on scroll while focused. */
import { useState } from 'react'
import { NumberInput } from '@milktop/react-ui'

export default function Example() {
  const [rate, setRate] = useState<number | null>(40)
  const [minutes, setMinutes] = useState<number | null>(60)
  return <>
    <NumberInput label="Hourly rate" value={rate} onValueChange={setRate} min={0} step={5}
      formatOptions={{ style: 'currency', currency: 'GBP' }} locale="en-GB" allowMouseWheel />
    <NumberInput label="Duration" value={minutes} onValueChange={setMinutes} min={15} max={180} step={15} suffix="min" />
    <p>{rate} ({typeof rate}), {minutes}</p>
  </>
}
