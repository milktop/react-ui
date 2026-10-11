/* With checkboxes
  `checkable`: ticking a branch ticks everything in it; a part-ticked branch shows a dash. */
import { useState } from 'react'
import { TreeView } from '@milktop/react-ui'
import { clinic } from './data'

export default function Example() {
  const [checked, setChecked] = useState<string[]>(['north-theatre'])
  return <>
    <TreeView items={clinic} checkable checked={checked} onCheckedChange={setChecked} defaultExpanded={['north', 'south']} className="w-72" />
    <p className="m-0 w-full text-sm text-(--ui-muted)">{JSON.stringify(checked)}</p>
  </>
}
