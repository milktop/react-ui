/* With breadcrumbs and actions
  The common page header: where you are, the title and a line under it, and the page's actions on the right (one main, the rest in a menu). */
import { Breadcrumbs, Button, Menu } from '@milktop/react-ui'

export default function Heading() {
  return (
    <div className="flex flex-col gap-3">
      <Breadcrumbs items={[{ label: 'Home', href: '#/', icon: 'lucide:house' }, { label: 'Invoices', href: '#/blocks/headings' }, { label: 'October' }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="m-0 text-xl font-bold">October invoices</h2>
          <p className="mt-1 mb-0 text-sm text-(--ui-muted)">14 sent, 3 waiting to go, £1,820 paid so far.</p>
        </div>
        <div className="flex gap-2">
          <Menu placement="bottom-end" items={[{ label: 'Export CSV', icon: 'lucide:download' }, { label: 'Print', icon: 'lucide:printer' }]}
            trigger={<Button iconEnd="lucide:chevron-down">More</Button>} />
          <Button variant="primary" icon="lucide:send">Send 3 invoices</Button>
        </div>
      </div>
    </div>
  )
}
