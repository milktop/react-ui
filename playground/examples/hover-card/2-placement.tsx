/* Placement and arrow */
import { HoverCard } from '@milktop/react-ui'

const team = [
  { name: 'Ada Lovelace', role: 'Maths', students: 12 },
  { name: 'Alan Turing', role: 'Computer science', students: 9 },
  { name: 'Grace Hopper', role: 'Physics', students: 14 },
]
const initials = (name: string) => name.split(' ').map((w) => w[0]).join('')

export default function Example() {
  return <>
    {team.map((person) => (
      <HoverCard key={person.name} placement="right" arrow trigger={(
        <button type="button" aria-label={person.name}
          className="grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-(--ui-accent-soft) p-0 text-sm font-semibold text-(--ui-accent-soft-text)">
          {initials(person.name)}
        </button>
      )}>
        <div className="font-semibold">{person.name}</div>
        <div className="text-xs text-(--ui-muted)">{person.role} · {person.students} students</div>
      </HoverCard>
    ))}
  </>
}
