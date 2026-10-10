/* Composed
  As with Dialog: Sheet.Header, Body and Footer as children, with a Sheet.Trigger child; the overlay is still done for you. Here a second body sits under a divider. */
import { Sheet, Button } from '@milktop/react-ui'

export default function Example() {
  return (
    <Sheet side="right">
      <Sheet.Trigger asChild><Button icon="lucide:receipt">Invoice #1042</Button></Sheet.Trigger>
      <Sheet.Header heading="Invoice #1042" description="Ada Lovelace · due 15 October" />
      <Sheet.Body>
        <div className="flex justify-between"><span className="text-(--ui-muted)">4 lessons × £35</span><strong>£140</strong></div>
      </Sheet.Body>
      <Sheet.Body className="border-t border-(--ui-border) text-sm text-(--ui-muted)">Paid by bank transfer, reference ADA-1042.</Sheet.Body>
      <Sheet.Footer><Button variant="primary" icon="lucide:send">Send reminder</Button></Sheet.Footer>
    </Sheet>
  )
}
