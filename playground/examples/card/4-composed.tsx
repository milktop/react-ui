/* Composed
  Card.Header, Card.Body and Card.Footer as children, placed as they are: here two bodies under one header. Card.Header takes `heading`, `description`, `icon` and `actions` too. */
import { Card, Button, Badge } from '@milktop/react-ui'

export default function Example() {
  return (
    <Card divided className="max-w-md">
      <Card.Header icon="lucide:users" heading="Ada Lovelace" description="GCSE Maths" actions={<Badge variant="success" dot>Active</Badge>} />
      <Card.Body className="flex justify-between"><span className="text-(--ui-muted)">Lessons this term</span><strong>12</strong></Card.Body>
      <Card.Body className="flex justify-between border-t border-(--ui-border)"><span className="text-(--ui-muted)">Outstanding</span><strong>£70</strong></Card.Body>
      <Card.Footer><Button size="sm" variant="primary">Book a lesson</Button></Card.Footer>
    </Card>
  )
}
