/* In a page header */
import { Breadcrumbs, Card, Page, Button } from '@milktop/react-ui'
import { lesson } from './lesson'

export default function Example() {
  return (
    <Card>
      <Page heading="Ada Lovelace" description="GCSE Maths, Thursdays at 16:00" breadcrumbs={<Breadcrumbs items={lesson.slice(0, 3)} />}
        actions={<Button size="sm" variant="primary" icon="lucide:calendar-plus">Book lesson</Button>} />
    </Card>
  )
}
