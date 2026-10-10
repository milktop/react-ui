/* Cards, with markup */
import { Timeline, Badge } from '@milktop/react-ui'

export default function Example() {
  return (
    <Timeline variant="cards">
      <Timeline.Item title="Note added" time="30 Sep" icon="lucide:notebook-pen">
        <p className="m-0 text-(--ui-muted)">Confident with fractions now; start on percentages next week.</p>
      </Timeline.Item>
      <Timeline.Item title="Homework set" time="24 Sep" icon="lucide:book-open" color="accent">
        <div className="flex flex-wrap gap-2"><Badge>Worksheet 4</Badge><Badge>Due 1 Oct</Badge></div>
      </Timeline.Item>
      <Timeline.Item title="First lesson" time="10 Sep" icon="lucide:sparkles" color="success" description="Assessment and goals for the year" />
    </Timeline>
  )
}
