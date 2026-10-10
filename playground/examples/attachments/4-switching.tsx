/* Switching layout
  The layout is the app’s choice: here a Segmented (icons only) controls it. */
import { useState } from 'react'
import { Attachments, Segmented } from '@milktop/react-ui'
import { files } from './files'

export default function Example() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  return (
    <div className="flex w-full flex-col gap-3">
      <Segmented items={[{ value: 'grid', label: 'Grid', icon: 'lucide:layout-grid' }, { value: 'list', label: 'List', icon: 'lucide:list' }]}
        iconOnly label="Layout" value={view} onValueChange={(v) => setView(v as 'grid' | 'list')} />
      <Attachments layout={view} defaultItems={files.slice(0, 5)} removable />
    </div>
  )
}
