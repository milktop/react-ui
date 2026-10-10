/* Colours
  `color="auto"` picks one from the name, so the same person always gets the same colour. */
import { Avatar } from '@milktop/react-ui'

const colors = ['accent', 'gray', 'red', 'orange', 'amber', 'green', 'teal', 'blue', 'purple', 'pink'] as const
const names = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Katherine Johnson', 'Edsger Dijkstra', 'Barbara Liskov', 'Donald Knuth', 'Margaret Hamilton']

export default function Example() {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap gap-2">{colors.map((color) => <Avatar key={color} color={color} name={color} />)}</div>
      <div className="flex flex-wrap gap-2">{names.map((name) => <Avatar key={name} color="auto" name={name} />)}</div>
    </div>
  )
}
