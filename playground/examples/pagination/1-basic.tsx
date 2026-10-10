/* Basic
  First and last buttons appear when some pages are hidden behind an ellipsis. */
import { useState } from 'react'
import { Pagination } from '@milktop/react-ui'

export default function Example() {
  const [page, setPage] = useState(4)
  return <>
    <Pagination count={95} pageSize={10} summary noun="students" page={page} onPageChange={setPage} className="w-full" />
    <p className="m-0 w-full text-sm text-(--ui-muted)">page: {page}</p>
  </>
}
