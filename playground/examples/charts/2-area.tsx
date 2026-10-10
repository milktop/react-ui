/* Area
  Hover for a tooltip. */
import { useState } from 'react'
import { AreaChart, Button } from '@milktop/react-ui'
import { months, pounds } from './months'

export default function Example() {
  const [data, setData] = useState(months)
  const shuffle = () => setData(months.map((m) => ({ ...m, revenue: Math.round(m.revenue * (0.6 + Math.random() * 0.8)) })))
  return <>
    <AreaChart data={data} x="month" y="revenue" format={pounds} label="Revenue by month" />
    <div className="flex gap-2"><Button size="sm" onClick={shuffle}>New data</Button><Button size="sm" onClick={() => setData(months)}>Reset</Button></div>
  </>
}
