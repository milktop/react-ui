/* Cards
  `variant="cards"`: each option a card, with the item's `icon` and `description`; the chosen one outlined. */
import { useState } from 'react'
import { RadioGroup } from '@milktop/react-ui'

const kinds = [
  { value: 'consult', label: 'Consultation', description: '15 minutes, any vet', icon: 'lucide:stethoscope' },
  { value: 'vaccine', label: 'Vaccination', description: '15 minutes, a nurse', icon: 'lucide:syringe' },
  { value: 'surgery', label: 'Surgery', description: 'Half a day, a surgeon', icon: 'lucide:scissors' },
]

export default function Example() {
  const [kind, setKind] = useState<string | null>('consult')
  return <>
    <RadioGroup label="Appointment" variant="cards" items={kinds} value={kind} onValueChange={setKind} className="col-span-full" />
    <p>kind: {JSON.stringify(kind)}</p>
  </>
}
