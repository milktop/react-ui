/* One part: `className` and `classes`
  `className` goes on the component's outer element; `classes` on its parts, by camelCased part name. The library's CSS sits in `@layer ui`, so these Tailwind classes win without `!important`. */
import { useState } from 'react'
import { Checkbox, Select, Tabs, Badge } from '@milktop/react-ui'

const subjects = ['Maths', 'English', 'Physics']

export default function Example() {
  const [agree, setAgree] = useState(true)
  return <>
    <Badge className="tracking-wider uppercase">Root only</Badge>
    <Checkbox label="Round tick box" checked={agree} onCheckedChange={setAgree}
      classes={{ control: 'rounded-full', label: 'font-semibold' }} />
    <Select items={subjects} defaultValue="Maths" className="w-48"
      classes={{ trigger: 'rounded-full', content: 'rounded-xl', item: 'font-medium' }} />
    <Tabs variant="pills" className="w-full" classes={{ trigger: 'uppercase text-xs tracking-wide', content: 'pt-4 text-sm' }}>
      <Tabs.Tab value="notes" label="Notes">Pills with uppercase triggers.</Tabs.Tab>
      <Tabs.Tab value="files" label="Files">The panel padding is ours too.</Tabs.Tab>
    </Tabs>
  </>
}
