/* By hand
  Ark's parts, styled by the same CSS: the size and colour are data attributes on the root. */
import { Avatar } from '@milktop/react-ui'

export default function Example() {
  return (
    <Avatar.Root data-size="lg" data-color="purple">
      <Avatar.Fallback>AL</Avatar.Fallback>
      <Avatar.Image src="https://i.pravatar.cc/120?img=47" alt="Ada Lovelace" />
    </Avatar.Root>
  )
}
