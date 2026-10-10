/* Folding long trails
  With `max`, the middle crumbs fold into a … button that lists them in a menu. */
import { useState } from 'react'
import { Breadcrumbs, Button } from '@milktop/react-ui'
import { lesson } from './lesson'

export default function Example() {
  const [max, setMax] = useState<number | null>(4)
  return <>
    <Breadcrumbs items={lesson} max={max} />
    <p className="m-0 flex w-full items-center gap-2 text-sm text-(--ui-muted)">max: {String(max)}
      <Button size="sm" onClick={() => setMax(3)}>max = 3</Button>
      <Button size="sm" onClick={() => setMax(4)}>max = 4</Button>
      <Button size="sm" onClick={() => setMax(null)}>No max</Button>
    </p>
  </>
}
