/* Custom items
  `renderItem` draws each option, given the item and whether it's picked. */
import { Select } from '@milktop/react-ui'

const people = [
  { id: 1, name: 'Ada Lovelace', role: 'Teacher' },
  { id: 2, name: 'Alan Turing', role: 'Student' },
  { id: 3, name: 'Grace Hopper', role: 'Admin' },
]

export default function Example() {
  return <>
    <Select label="Person" items={people} labelKey="name" valueKey="id" defaultValue={1}
      renderItem={(person) => (
        <span className="flex flex-col">
          <span>{person.name}</span>
          <span className="text-xs text-(--ui-muted)">{person.role}</span>
        </span>
      )} />
    <Select label="Nothing to pick" items={[]} empty={<em>No people yet</em>} />
  </>
}
