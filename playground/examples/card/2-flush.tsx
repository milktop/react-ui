/* Flush
  No padding round the body, for lists and tables that run edge to edge. */
import { Card } from '@milktop/react-ui'

const lessons = ['Ada: Thursday 16:00', 'Alan: Friday 10:00', 'Grace: Monday 09:30']

export default function Example() {
  return (
    <Card heading="This week" flush className="max-w-md">
      <ul className="m-0 list-none p-0">
        {lessons.map((lesson) => <li key={lesson} className="border-b border-(--ui-border) px-5 py-3 last:border-0">{lesson}</li>)}
      </ul>
    </Card>
  )
}
