/* A page header
  Heading, description and `actions`, above the content. (Shown in a box here; normally it fills the main area.) */
import { useState } from 'react'
import { Page, Button, Card, Input } from '@milktop/react-ui'

export default function Example() {
  const [query, setQuery] = useState('')
  return (
    <div className="w-full rounded-xl border border-(--ui-border)">
      <Page heading="Students" description="12 students" width="full"
        actions={<Button variant="primary" icon="lucide:plus">Add student</Button>}>
        <Input icon="lucide:search" placeholder="Search…" value={query} onValueChange={setQuery} className="mb-4 w-64" />
        <Card>Students matching “{query}” would be listed here.</Card>
      </Page>
    </div>
  )
}
