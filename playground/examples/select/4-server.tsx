/* Server search
  `load` is an async function(query) returning items: here a fake API with a delay. It's debounced, shows "Loading…", and only the latest answer counts. */
import { useState } from 'react'
import { Select } from '@milktop/react-ui'

type City = { id: number, name: string }

const all: City[] = ['Aberdeen', 'Bath', 'Belfast', 'Brighton', 'Bristol', 'Cambridge', 'Cardiff', 'Edinburgh', 'Glasgow', 'Leeds',
  'Liverpool', 'London', 'Manchester', 'Norwich', 'Oxford', 'York'].map((name, id) => ({ id, name }))

// Stands in for fetch(`/cities?q=${query}`).
const search = (query: string) => new Promise<City[]>((resolve) =>
  setTimeout(() => resolve(all.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)), 400))

export default function Example() {
  const [cityId, setCityId] = useState<number | null>(null)
  return <>
    <Select label="City" load={search} labelKey="name" valueKey="id" value={cityId} onValueChange={setCityId} placeholder="Search cities…" />
    <p>{cityId ?? '—'}</p>
  </>
}
