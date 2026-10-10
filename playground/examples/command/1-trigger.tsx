/* With a trigger
  Type to filter (words match the label, description, group and keywords), ↑/↓ to move, Enter to pick. Set `hotkey={null}` when another menu owns ⌘K, as here: the playground's search does. */
import { useState } from 'react'
import { Command, Button } from '@milktop/react-ui'
import { actions } from './actions'

export default function Example() {
  const [picked, setPicked] = useState<unknown>(null)
  return <>
    <Command items={actions} hotkey={null} onSelect={setPicked} trigger={<Button icon="lucide:terminal">Lesson actions</Button>} />
    <p className="m-0 w-full text-sm text-(--ui-muted)">picked: {JSON.stringify(picked)}</p>
  </>
}
