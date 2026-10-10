/* A part's content: slots and render functions
  Where a part's markup is the thing to change, the component takes a node or a function for it: a checkbox's indicator, a select's items, a tab's label. */
import { useState } from 'react'
import { Checkbox, Select, Avatar } from '@milktop/react-ui'

const people = [{ id: 1, name: 'Ada Lovelace' }, { id: 2, name: 'Alan Turing' }, { id: 3, name: 'Grace Hopper' }]

export default function Example() {
  const [done, setDone] = useState(true)
  return <>
    <Checkbox label="Starred" checked={done} onCheckedChange={setDone} indicator={<iconify-icon icon="lucide:star" />} />
    <Select items={people} labelKey="name" valueKey="id" defaultValue={1} className="w-60"
      renderItem={(person) => <span className="flex items-center gap-2"><Avatar size="sm" name={person.name} color="auto" />{person.name}</span>} />
  </>
}
