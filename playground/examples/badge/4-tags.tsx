/* Tags
  `onRemove` adds an ✕: applied filters, or a record's labels. */
import { useState } from 'react'
import { Badge, Button } from '@milktop/react-ui'

const all = ['Status: Active', 'Subject: Maths', 'Year 11']

export default function Example() {
  const [filters, setFilters] = useState(all)
  return <>
    {filters.map((f) => <Badge key={f} variant="accent" onRemove={() => setFilters(filters.filter((x) => x !== f))}>{f}</Badge>)}
    {filters.length < all.length && <Button size="sm" variant="link" onClick={() => setFilters(all)}>Reset</Button>}
  </>
}
