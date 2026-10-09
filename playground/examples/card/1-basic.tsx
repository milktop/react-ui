/* Header, actions and footer
  `heading` and `description`, plus `actions` and `footer`. */
import { Card, Button } from '@milktop/react-ui'

export default function Example() {
  return (
    <Card heading="Next lesson" description="Thursday at 16:00 with Ada" className="max-w-md"
      actions={<Button size="sm">Reschedule</Button>}
      footer={<><Button size="sm" variant="ghost">Cancel</Button><Button size="sm" variant="primary">Start</Button></>}>
      Quadratic equations: past paper 2, questions 4 to 7.
    </Card>
  )
}
