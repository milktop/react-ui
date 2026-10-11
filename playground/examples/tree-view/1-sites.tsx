/* Sites and rooms
  Click (or Enter) to select; ←→ close and open. `onSelect` gets the chosen item (not a branch). */
import { useState } from 'react'
import { TreeView, type TreeItem } from '@milktop/react-ui'
import { clinic } from './data'

export default function Example() {
  const [picked, setPicked] = useState<TreeItem | null>(null)
  return <>
    <TreeView items={clinic} defaultExpanded={['north']} onSelect={setPicked} label="Rooms" className="w-72" />
    <p className="m-0 w-full text-sm text-(--ui-muted)">picked: {String(picked?.label ?? '')}</p>
  </>
}
