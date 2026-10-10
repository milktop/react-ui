/* Server search
  With `load`, each search calls an async function (debounced) for the results. */
import { useState } from 'react'
import { Command, Button, type CommandItem } from '@milktop/react-ui'

const people = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Katherine Johnson', 'Margaret Hamilton', 'Tim Berners-Lee', 'Edsger Dijkstra', 'Barbara Liskov']

// Pretends to be a server: matching people, after a short wait.
async function findPeople(query: string): Promise<CommandItem[]> {
  await new Promise((done) => setTimeout(done, 300))
  const q = query.trim().toLowerCase()
  return people.filter((name) => name.toLowerCase().includes(q)).map((name) => ({ label: name, value: name, icon: 'lucide:user', description: 'Student' }))
}

export default function Example() {
  const [open, setOpen] = useState(false)
  const [person, setPerson] = useState<unknown>(null)
  return <>
    <Command load={findPeople} hotkey={null} placeholder="Search students…" emptyText="No students found"
      open={open} onOpenChange={setOpen} onSelect={setPerson} />
    <Button icon="lucide:search" onClick={() => setOpen(true)}>Find a student</Button>
    <p className="m-0 w-full text-sm text-(--ui-muted)">person: {JSON.stringify(person)}</p>
  </>
}
