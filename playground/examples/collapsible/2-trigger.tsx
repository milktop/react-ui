/* Own trigger
  `trigger`: your own button gets the toggle's props. */
import { useState } from 'react'
import { Collapsible, Button } from '@milktop/react-ui'

export default function Example() {
  const [more, setMore] = useState(false)
  return <>
    <div className="w-full">
      <p className="mt-0">Ada has taught maths for twelve years and specialises in GCSE preparation.</p>
      <Collapsible open={more} onOpenChange={setMore}
        trigger={<Button variant="link" iconEnd={more ? 'lucide:chevron-up' : 'lucide:chevron-down'}>{more ? 'Show less' : 'Show more'}</Button>}>
        She studied mathematics at Cambridge and has helped over 200 students improve by at least two grades.
      </Collapsible>
    </div>
    <p className="m-0 flex w-full items-center gap-3 text-sm text-(--ui-muted)">more: {String(more)}
      <Button size="sm" onClick={() => setMore(!more)}>Toggle from outside</Button>
    </p>
  </>
}
