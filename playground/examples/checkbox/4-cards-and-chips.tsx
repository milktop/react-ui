/* Cards and chips
  CheckboxGroup's `variant="cards"` (with `icon` and `description`) and `variant="chips"`: pills that toggle, e.g. quick filters above a table. */
import { useState } from 'react'
import { CheckboxGroup } from '@milktop/react-ui'

const extras = [
  { value: 'reminder', label: 'Text reminder', description: 'The day before', icon: 'lucide:message-square' },
  { value: 'invoice', label: 'Email the invoice', description: 'After the visit', icon: 'lucide:receipt' },
]
const species = ['Dogs', 'Cats', 'Rabbits', 'Birds', 'Reptiles']

export default function Example() {
  const [chosen, setChosen] = useState<string[]>(['reminder'])
  const [filters, setFilters] = useState<string[]>(['Dogs', 'Cats'])
  return <>
    <CheckboxGroup label="Extras" variant="cards" items={extras} value={chosen} onValueChange={setChosen} className="col-span-full" />
    <CheckboxGroup label="Show" variant="chips" items={species} value={filters} onValueChange={setFilters} className="col-span-full" />
    <p>{JSON.stringify({ chosen, filters })}</p>
  </>
}
