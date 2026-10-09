/* Icons, loading and counts
  `icon` and `iconEnd` take Iconify names; `loading` swaps the icon for a spinner; `count` and `dot` badge the corner. */
import { useState } from 'react'
import { Button } from '@milktop/react-ui'

export default function Example() {
  const [saving, setSaving] = useState(false)
  function save() {
    setSaving(true)
    setTimeout(() => setSaving(false), 1500)
  }
  return <>
    <Button variant="primary" icon="lucide:save" loading={saving} onClick={save}>Save</Button>
    <Button iconEnd="lucide:arrow-right">Next</Button>
    <Button icon="lucide:settings" aria-label="Settings" />
    <Button icon="lucide:inbox" count={3}>Inbox</Button>
    <Button icon="lucide:bell" aria-label="Notifications" dot pulse round />
  </>
}
