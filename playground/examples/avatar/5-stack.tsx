/* Stacked, with tooltips
  AvatarGroup overlaps them, rings each in the page colour, and folds the rest into a "+N" (its tooltip lists them). */
import { AvatarGroup } from '@milktop/react-ui'

const team = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Katherine Johnson', 'Margaret Hamilton', 'Tim Berners-Lee']

export default function Example() {
  return <AvatarGroup items={team} max={4} tooltip color="auto" />
}
