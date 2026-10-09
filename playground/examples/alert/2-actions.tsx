/* With actions, dismissible
  `actions` for buttons; `onDismiss` adds the close button. */
import { useState } from 'react'
import { Alert, Button } from '@milktop/react-ui'

export default function Example() {
  const [shown, setShown] = useState(true)
  return shown
    ? <Alert variant="warning" heading="Your profile is incomplete" onDismiss={() => setShown(false)} className="w-full"
        actions={<Button size="sm">Add availability</Button>}>
        Students can’t book you until you add your availability.
      </Alert>
    : <Button size="sm" onClick={() => setShown(true)}>Show it again</Button>
}
