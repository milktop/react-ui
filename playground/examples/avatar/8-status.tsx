/* Status
  `status`: a dot on the corner, 'online', 'away', 'busy', 'offline' or any CSS colour. In a stack each dot stays in view over the next avatar. */
import { Avatar, AvatarGroup } from '@milktop/react-ui'

export default function Example() {
  return <>
    <Avatar name="Ada Lovelace" src="https://i.pravatar.cc/120?img=47" status="online" />
    <Avatar name="Alan Turing" status="away" />
    <Avatar name="Grace Hopper" size="lg" status="busy" statusLabel="In surgery" />
    <Avatar name="Tim Berners-Lee" size="sm" status="offline" />
    <AvatarGroup size="sm">
      <Avatar name="Ada Lovelace" color="auto" status="online" />
      <Avatar name="Alan Turing" color="auto" status="away" />
      <Avatar name="Grace Hopper" color="auto" status="online" />
    </AvatarGroup>
  </>
}
