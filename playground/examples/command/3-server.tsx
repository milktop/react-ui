/* Server search
  With `load`, each search calls an async function (debounced) for more
  results, listed after the matching `items`: those filter at once, the
  loaded ones join them when they arrive. */
import { useState } from 'react'
import { Command, Button, type CommandItem } from '@milktop/react-ui'
import { actions } from './actions'

const people = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Katherine Johnson', 'Margaret Hamilton', 'Tim Berners-Lee', 'Edsger Dijkstra', 'Barbara Liskov']

// Pretends to be a server: matching people, after a wait.
async function findPeople(query: string): Promise<CommandItem[]> {
  await new Promise((done) => setTimeout(done, 600))
  const q = query.trim().toLowerCase()
  return people.filter((name) => name.toLowerCase().includes(q)).map((name) => ({ label: name, value: name, icon: 'lucide:user', description: 'Student', group: 'People' }))
}

export default function Example() {
  const [open, setOpen] = useState(false)
  const [person, setPerson] = useState<unknown>(null)
  return <>
    <Command items={actions} load={findPeople} hotkey={null} placeholder="Search…" emptyText="Nothing found"
      open={open} onOpenChange={setOpen} onSelect={setPerson} />
    <Button icon="lucide:search" onClick={() => setOpen(true)}>Search</Button>
    <p className="m-0 w-full text-sm text-(--ui-muted)">picked: {JSON.stringify(person)}</p>
  </>
}
