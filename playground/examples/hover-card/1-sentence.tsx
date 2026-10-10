/* In a sentence */
import { HoverCard, Button, Avatar } from '@milktop/react-ui'

export default function Example() {
  return (
    <p className="m-0">
      Next lesson: GCSE Maths with{' '}
      <HoverCard trigger={<a href="#/hover-card" className="text-(--ui-accent) underline underline-offset-2">Ada Lovelace</a>}>
        <div className="flex gap-3">
          <Avatar name="Ada Lovelace" />
          <div>
            <div className="font-semibold">Ada Lovelace</div>
            <div className="text-xs text-(--ui-muted)">Year 11 · ada@example.com</div>
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-(--ui-muted)">
          <span><b className="text-(--ui-text)">24</b> lessons</span>
          <span><b className="text-(--ui-text)">92%</b> attendance</span>
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm">Message</Button>
          <Button size="sm" variant="primary">View profile</Button>
        </div>
      </HoverCard>, Thursday at 16:00.
    </p>
  )
}
