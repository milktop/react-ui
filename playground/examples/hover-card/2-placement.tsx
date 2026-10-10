/* Placement and arrow */
import { HoverCard, Avatar } from '@milktop/react-ui'

const team = [
  { name: 'Ada Lovelace', role: 'Maths', students: 12 },
  { name: 'Alan Turing', role: 'Computer science', students: 9 },
  { name: 'Grace Hopper', role: 'Physics', students: 14 },
]

export default function Example() {
  return <>
    {team.map((person) => (
      <HoverCard key={person.name} placement="right" arrow trigger={(
        <button type="button" aria-label={person.name} className="cursor-pointer rounded-full border-0 bg-transparent p-0">
          <Avatar name={person.name} color="auto" />
        </button>
      )}>
        <div className="font-semibold">{person.name}</div>
        <div className="text-xs text-(--ui-muted)">{person.role} · {person.students} students</div>
      </HoverCard>
    ))}
  </>
}
