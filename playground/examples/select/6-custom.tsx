/* Custom items and parts
  `renderItem` draws each option, given the item and whether it's picked; `classes` reaches into the trigger and the list; `empty` replaces the empty text. */
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
    <Select label="Colour" items={['Pink', 'Teal', 'Amber']} defaultValue="Pink"
      classes={{ trigger: 'rounded-full border-pink-300', item: 'rounded-full', itemIndicator: 'text-pink-600' }} />
    <Select label="Nothing to pick" items={[] as string[]} empty={<em>No people yet</em>} />
  </>
}
