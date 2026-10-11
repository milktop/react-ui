/* Search results
  The parts matching the query are marked; several words mark each. */
import { useState } from 'react'
import { Highlight, Input } from '@milktop/react-ui'

const people = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Katherine Johnson', 'Margaret Hamilton', 'Barbara Liskov']

export default function Example() {
  const [query, setQuery] = useState('an')
  const words = query.split(/\s+/).filter(Boolean)
  return (
    <div className="flex w-full flex-col gap-3">
      <Input icon="lucide:search" value={query} onValueChange={setQuery} className="w-64" />
      <ul className="m-0 list-none p-0 text-sm">
        {people.filter((p) => !words.length || words.some((w) => p.toLowerCase().includes(w.toLowerCase()))).map((p) => (
          <li key={p} className="py-1"><Highlight text={p} query={words} /></li>
        ))}
      </ul>
    </div>
  )
}
