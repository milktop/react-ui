/* Overflow
  Tabs that don't fit move into a menu at the row's end; the selected one stays in the row. Narrow the window to see it. */
import { useState } from 'react'
import { Tabs } from '@milktop/react-ui'

const sections = ['Consultations', 'Invoices', 'Payments', 'Quotes', 'Notes', 'Messages', 'Details', 'Products', 'Files']

export default function Example() {
  const [tab, setTab] = useState<string | number | null>('Consultations')
  return (
    <div className="w-full max-w-xl resize-x overflow-hidden border border-dashed border-(--ui-border) p-2">
      <Tabs value={tab} onValueChange={setTab} overflow="menu">
        {sections.map((name, index) => (
          <Tabs.Tab key={name} value={name} label={name} count={index === 1 ? 3 : index === 8 ? 25 : undefined}>{name}</Tabs.Tab>
        ))}
      </Tabs>
    </div>
  )
}
