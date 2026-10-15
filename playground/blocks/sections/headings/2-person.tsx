/* A person, with meta and tabs
  An avatar, a status, a row of facts with icons, and tabs (with counts) underneath that switch the page's sections. */
import { Avatar, Badge, Button, Tabs } from '@milktop/react-ui'

const facts = [['lucide:book-open', 'GCSE Maths'], ['lucide:calendar', 'Thursdays, 16:00'], ['lucide:map-pin', 'Online']]

export default function Heading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar size="lg" name="Alan Turing" color="teal" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><h2 className="m-0 text-xl font-bold">Alan Turing</h2><Badge variant="warning" dot>Paused</Badge></div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-(--ui-muted)">
            {facts.map(([icon, text]) => <span key={text} className="inline-flex items-center gap-1.5"><iconify-icon icon={icon} />{text}</span>)}
          </div>
        </div>
        <Button icon="lucide:play">Resume lessons</Button>
      </div>
      <Tabs defaultValue="overview">
        <Tabs.Tab value="overview" label="Overview" />
        <Tabs.Tab value="lessons" label="Lessons" count={12} />
        <Tabs.Tab value="invoices" label="Invoices" count={2} countColor="danger" />
        <Tabs.Tab value="files" label="Files" />
      </Tabs>
    </div>
  )
}
