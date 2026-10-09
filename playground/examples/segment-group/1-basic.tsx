/* Options in a row
  Strings or objects with icons; `iconOnly` keeps just the icons (their labels show on hover and keyboard focus); `size` matches the buttons. */
import { useState } from 'react'
import { Segmented } from '@milktop/react-ui'

export default function Example() {
  const [view, setView] = useState<string | null>('Week')
  const [layout, setLayout] = useState<string | null>('list')
  return <>
    <Segmented label="View" items={['Day', 'Week', 'Month']} value={view} onValueChange={setView} />
    <Segmented label="Layout" iconOnly value={layout} onValueChange={setLayout}
      items={[{ value: 'list', label: 'List', icon: 'lucide:list' }, { value: 'grid', label: 'Grid', icon: 'lucide:grid-2x2' }]} />
    <Segmented label="Size" size="sm" items={['S', 'M', 'L']} defaultValue="M" />
    <p>{view}, {layout}</p>
  </>
}
