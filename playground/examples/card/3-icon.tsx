/* Icon and divider
  `icon` puts a tinted tile beside the heading; `divided` draws a line under the header. */
import { Card, Button, Badge } from '@milktop/react-ui'

export default function Example() {
  return (
    <Card icon="lucide:receipt" heading="Invoice #1042" description="Ada Lovelace · due 15 October" divided className="max-w-md"
      actions={<Badge variant="warning" dot>Unpaid</Badge>}
      footer={<><Button size="sm" variant="ghost">Download</Button><Button size="sm" variant="primary" icon="lucide:send">Send reminder</Button></>}>
      <div className="flex items-baseline justify-between"><span className="text-(--ui-muted)">4 lessons × £35</span><span className="text-2xl font-bold">£140</span></div>
    </Card>
  )
}
