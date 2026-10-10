/* Image and fallbacks
  Ada has a photo, Alan has none, Grace’s fails to load, and the last has no name. */
import { Avatar } from '@milktop/react-ui'

const people = [
  { name: 'Ada Lovelace', src: 'https://i.pravatar.cc/120?img=47' },
  { name: 'Alan Turing', src: null },
  { name: 'Grace Hopper', src: 'https://example.invalid/missing.jpg' },
  { name: null, src: null },
]

export default function Example() {
  return people.map((person, i) => <Avatar key={i} src={person.src} name={person.name} />)
}
