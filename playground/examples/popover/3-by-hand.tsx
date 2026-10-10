/* By hand
  Ark's parts: a title with a count, and an anchor elsewhere than the trigger. They pick up the same styles. */
import { Popover, Button, Badge } from '@milktop/react-ui'

export default function Example() {
  return (
    <Popover.Root positioning={{ placement: 'bottom-start' }}>
      <Popover.Trigger asChild><Button icon="lucide:bell">Notifications</Button></Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content className="w-72">
          <Popover.Header><Popover.Title>Notifications <Badge size="sm" variant="accent">2</Badge></Popover.Title></Popover.Header>
          <p className="m-0 text-sm">Grace replied about Thursday.</p>
          <p className="mt-2 mb-0 text-sm">Invoice #1042 was paid.</p>
          <Popover.CloseTrigger aria-label="Close"><iconify-icon icon="lucide:x" /></Popover.CloseTrigger>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}
