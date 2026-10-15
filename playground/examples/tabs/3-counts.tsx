/* Counts and dots
  A Tab's `count` follows its label (hidden at 0, "99+" past `max`), or a `dot`; `countColor` colours it and `pulse` ripples it. Quiet by default, it takes the accent on the selected tab. Inline suits both variants; `counts="corner"` raises them into the tab's top right instead, like a button's. */
import { Tabs } from '@milktop/react-ui'

export default function Example() {
  return <>
    <Tabs>
      <Tabs.Tab value="inbox" label="Inbox" count={4} countLabel="unread">4 unread messages.</Tabs.Tab>
      <Tabs.Tab value="invoices" label="Invoices" count={2} countColor="danger" countLabel="overdue">2 invoices are overdue.</Tabs.Tab>
      <Tabs.Tab value="reports" label="Reports" dot pulse countColor="accent" countLabel="new">A new report is ready.</Tabs.Tab>
      <Tabs.Tab value="archive" label="Archive" count={120}>Everything else.</Tabs.Tab>
    </Tabs>
    <Tabs variant="pills">
      <Tabs.Tab value="inbox" label="Inbox" count={4} countColor="danger">4 unread messages.</Tabs.Tab>
      <Tabs.Tab value="drafts" label="Drafts" dot countColor="accent">One draft has changed.</Tabs.Tab>
      <Tabs.Tab value="sent" label="Sent">Sent messages.</Tabs.Tab>
    </Tabs>
    <Tabs counts="corner">
      <Tabs.Tab value="inbox" label="Inbox" count={4} countColor="danger">4 unread messages.</Tabs.Tab>
      <Tabs.Tab value="drafts" label="Drafts" dot countColor="accent">One draft has changed.</Tabs.Tab>
      <Tabs.Tab value="sent" label="Sent">Sent messages.</Tabs.Tab>
    </Tabs>
  </>
}
