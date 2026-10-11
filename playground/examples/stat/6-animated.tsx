/* Live, rolling
  A number `value` is formatted (`format`: Intl's options); `animate` rolls its digits when it changes. */
import { useEffect, useState } from 'react'
import { Stats, Stat } from '@milktop/react-ui'

export default function Example() {
  const [today, setToday] = useState(23)
  const [revenue, setRevenue] = useState(1820)
  // New bookings and payments every few seconds.
  useEffect(() => {
    const timer = setInterval(() => {
      setToday((n) => n + 1)
      setRevenue((n) => n + 40 * Math.ceil(Math.random() * 3))
    }, 2500)
    return () => clearInterval(timer)
  }, [])
  return (
    <Stats columns={2}>
      <Stat label="Appointments today" value={today} animate />
      <Stat label="Taken this month" value={revenue} animate format={{ style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }} change={8.4} />
    </Stats>
  )
}
