/* Loading and empty
  `loading` shows skeleton rows while there are none; `empty` replaces `emptyText`. */
import { useState } from 'react'
import { Table, EmptyState, Button } from '@milktop/react-ui'
import { students } from './students'
import { columns } from './columns'

export default function Example() {
  const [loading, setLoading] = useState(false)
  const [empty, setEmpty] = useState(false)
  return (
    <div className="flex w-full flex-col gap-3">
      <Table columns={columns} rows={empty || loading ? [] : students.slice(0, 4)} loading={loading} empty={
        <EmptyState icon="lucide:users" heading="No students yet" description="Add your first student to get started.">
          <Button size="sm" variant="primary" icon="lucide:plus">Add student</Button>
        </EmptyState>
      } />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setLoading(!loading)}>{loading ? 'Stop loading' : 'Load'}</Button>
        <Button size="sm" onClick={() => setEmpty(!empty)}>{empty ? 'Show rows' : 'Empty'}</Button>
      </div>
    </div>
  )
}
