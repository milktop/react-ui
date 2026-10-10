/* Students
  Sorting, search, paging, custom cells and a row menu. Tick rows (Shift-click to tick a run) and an action bar appears. */
import { useState } from 'react'
import {
  Table, sortRows, Pagination, Input, Avatar, Badge, Menu, Button, ActionBar, toaster, type TableColumn, type TableSort,
} from '@milktop/react-ui'
import { students, type Student } from './students'

const pageSize = 8
const tones = { Active: 'success', Paused: 'warning', New: 'accent' } as const

const rowActions = [
  { value: 'message', label: 'Message', icon: 'lucide:message-square' },
  { value: 'book', label: 'Book lesson', icon: 'lucide:calendar-plus' },
  { separator: true },
  { value: 'archive', label: 'Archive', icon: 'lucide:archive', danger: true },
]

const columns: TableColumn<Student>[] = [
  { key: 'name', label: 'Student', sortable: true, cell: ({ row }) => (
    <div className="flex items-center gap-2.5">
      <Avatar name={row.name} size="sm" />
      <div>{row.name}<div className="text-xs text-(--ui-muted)">{row.email}</div></div>
    </div>
  ) },
  { key: 'year', label: 'Year', sortable: true, align: 'end' },
  { key: 'subject', label: 'Subject', sortable: true },
  { key: 'status', label: 'Status', sortable: true, cell: ({ row }) => <Badge variant={tones[row.status]}>{row.status}</Badge> },
  { key: 'lessons', label: 'Lessons', sortable: true, align: 'end' },
  { key: 'fee', label: 'Fee', align: 'end', format: (v) => `£${v}` },
  { key: 'actions', label: '', width: '3rem', cell: ({ row }) => (
    <Menu items={rowActions} label={row.name} placement="bottom-end" onSelect={(value) => toaster.info({ title: `${String(value)}: ${row.name}` })}
      trigger={<Button size="sm" variant="ghost" icon="lucide:ellipsis" aria-label={`Actions for ${row.name}`} />} />
  ) },
]

export default function Example() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<(string | number)[]>([])
  const [sort, setSort] = useState<TableSort>({ key: 'name', dir: 'asc' })

  // Filtered, then sorted, then paged: the whole list is sorted (manualSort)
  // and the table shows just this page.
  const q = query.trim().toLowerCase()
  const filtered = q ? students.filter((s) => `${s.name} ${s.email} ${s.subject}`.toLowerCase().includes(q)) : students
  const pageRows = sortRows(filtered, columns, sort).slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="flex w-full flex-col gap-3">
      <Input icon="lucide:search" placeholder="Search students" value={query} onValueChange={(v) => { setQuery(v); setPage(1) }} className="w-full sm:w-64" />
      <Table columns={columns} rows={pageRows} manualSort selectable selected={selected} onSelectedChange={setSelected}
        sort={sort} onSortChange={(next) => { setSort(next); setPage(1) }} label="Students"
        onRowClick={(row) => toaster.info({ title: `Open ${row.name}` })} />
      <Pagination count={filtered.length} pageSize={pageSize} summary noun="students" page={page} onPageChange={setPage} />
      {/* Floats at the bottom of the screen while rows are ticked. */}
      <ActionBar open={selected.length > 0} onClose={() => setSelected([])} selection={`${selected.length} selected`}>
        <Button size="sm" icon="lucide:send" onClick={() => toaster.info({ title: `Message ${selected.length} students` })}>Message</Button>
        <Button size="sm" icon="lucide:calendar-plus">Book lessons</Button>
        <Button size="sm" variant="danger" icon="lucide:archive" onClick={() => setSelected([])}>Archive</Button>
      </ActionBar>
      <p className="m-0 text-sm text-(--ui-muted)">{JSON.stringify({ page, sort, selected })}</p>
    </div>
  )
}
