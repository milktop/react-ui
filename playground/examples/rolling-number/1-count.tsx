/* Rolling digits
  Change the number and its digits roll (still, with reduced motion). Formatted like FormatNumber; screen readers hear the whole number. */
import { useState } from 'react'
import { RollingNumber, Button } from '@milktop/react-ui'

export default function Example() {
  const [count, setCount] = useState(128)
  const [money, setMoney] = useState(18240)
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold"><RollingNumber value={count} /></span>
        <Button size="sm" icon="lucide:minus" aria-label="One less" onClick={() => setCount(count - 1)} />
        <Button size="sm" icon="lucide:plus" aria-label="One more" onClick={() => setCount(count + 1)} />
        <Button size="sm" onClick={() => setCount(Math.round(Math.random() * 2000))}>Random</Button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-semibold"><RollingNumber value={money} format={{ style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }} duration={900} /></span>
        <Button size="sm" onClick={() => setMoney(money + Math.round(Math.random() * 500))}>Payment in</Button>
      </div>
    </div>
  )
}
