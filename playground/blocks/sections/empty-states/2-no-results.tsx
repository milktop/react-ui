/* No results
  A search that found nothing says what was searched, and offers to clear it. */
import { useState } from 'react'
import { Card, Input, EmptyState, Button } from '@milktop/react-ui'
import { students } from '../../data'

export default function NoResults() {
  const [query, setQuery] = useState('Zuse')
  const found = students.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()))
  return (
    <Card>
      <div className="flex flex-col gap-4">
        <Input icon="lucide:search" value={query} onValueChange={setQuery} placeholder="Search students" className="w-full sm:w-72" />
        {found.length
          ? <p className="m-0 text-sm text-(--ui-muted)">{found.length} found: {found.slice(0, 4).map((s) => s.name).join(', ')}…</p>
          : <EmptyState icon="lucide:search-x" heading={`No students match “${query}”`} description="Check the spelling, or search by email.">
              <Button onClick={() => setQuery('')}>Clear search</Button>
            </EmptyState>}
      </div>
    </Card>
  )
}
