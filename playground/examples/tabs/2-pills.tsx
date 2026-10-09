/* Pills */
import { useState } from 'react'
import { Tabs, Tab } from '@milktop/react-ui'

export default function Example() {
  const [view, setView] = useState<string | number | null>('week')
  return <>
    <Tabs variant="pills" value={view} onValueChange={setView}>
      <Tab value="day" label="Day">Today: 3 lessons.</Tab>
      <Tab value="week" label="Week">This week: 14 lessons.</Tab>
      <Tab value="month" label="Month">October: 52 lessons.</Tab>
    </Tabs>
    <p className="m-0 w-full text-sm text-(--ui-muted)">view: {JSON.stringify(view)}</p>
  </>
}
