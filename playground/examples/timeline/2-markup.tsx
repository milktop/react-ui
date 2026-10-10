/* As markup */
import { Timeline } from '@milktop/react-ui'

export default function Example() {
  return (
    <Timeline>
      <Timeline.Item title="Lesson booked" time="2 Oct" icon="lucide:calendar-plus" color="accent" description="Thursday 8 October, 16:00" />
      <Timeline.Item title="Invoice paid" time="1 Oct" icon="lucide:receipt" color="success" description="£120 for September" />
      <Timeline.Item title="Joined" time="1 Sep" icon="lucide:user-plus" />
    </Timeline>
  )
}
