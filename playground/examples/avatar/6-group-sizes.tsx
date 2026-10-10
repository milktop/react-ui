/* Group sizes and spacing
  `size` and `spacing` ('tight', 'normal' or 'loose'); or put Avatars in it yourself. */
import { AvatarGroup, Avatar } from '@milktop/react-ui'

const team = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Katherine Johnson', 'Margaret Hamilton']

export default function Example() {
  return (
    <div className="flex w-full flex-col items-start gap-4">
      <AvatarGroup items={team} size="sm" max={3} />
      <AvatarGroup items={team} size="lg" spacing="tight" color="auto" />
      <AvatarGroup items={team} spacing="loose" square letters={1} />
      <AvatarGroup>
        <Avatar name="Ada Lovelace" src="https://i.pravatar.cc/120?img=47" />
        <Avatar name="Alan Turing" color="teal" />
      </AvatarGroup>
    </div>
  )
}
