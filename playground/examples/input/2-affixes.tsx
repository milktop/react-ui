/* Icons, affixes and slots
  `icon`, `prefix` and `suffix` for the usual cases; `start` and `end` for anything else; `round` for a pill. */
import { Input, Button } from '@milktop/react-ui'

export default function Example() {
  return <>
    <Input label="Search" icon="lucide:search" placeholder="Search…" round />
    <Input label="Rate" prefix="£" suffix="per hour" type="number" />
    <Input label="Invite" placeholder="name@example.com" type="email"
      end={<Button size="sm" variant="ghost" className="-mr-2">Send</Button>} />
  </>
}
