/* Switches
  `checked` and `onCheckedChange`, with a label. */
import { useState } from 'react'
import { Switch } from '@milktop/react-ui'

export default function Example() {
  const [reminders, setReminders] = useState(true)
  return <>
    <Switch checked={reminders} onCheckedChange={setReminders}>Email reminders</Switch>
    <Switch label="Disabled" disabled />
    <p>reminders: {String(reminders)}</p>
  </>
}
