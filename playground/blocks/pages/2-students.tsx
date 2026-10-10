/* Students
  Search and filters over a selectable, sortable table in one card, with paging. Clicking a row opens the student in a sheet; ticking rows brings up the action bar. */
import { useState } from 'react'
import {
  Card, Table, sortRows, Pagination, Input, Select, Segmented, Avatar, Badge, Button, ActionBar, Sheet, DataList, Timeline, Stat, Stats,
  toaster, type TableColumn, type TableSort,
} from '@milktop/react-ui'
import { students, subjectNames, statusTone, activity, pounds, type Student } from '../data'

const pageSize = 8
const statuses = [{ value: 'all', label: 'All' }, { value: 'Active', label: 'Active' }, { value: 'Paused', label: 'Paused' }, { value: 'New', label: 'New' }]

const columns: TableColumn<Student>[] = [
  { key: 'name', label: 'Student', sortable: true, cell: ({ row }) => (
    <span className="flex items-center gap-2.5"><Avatar size="sm" name={row.name} color="auto" />
      <span>{row.name}<span className="block text-xs text-(--ui-muted)">{row.email}</span></span></span>
  ) },
  { key: 'subject', label: 'Subject', sortable: true },
  { key: 'year', label: 'Year', sortable: true, align: 'end' },
  { key: 'status', label: 'Status', sortable: true, cell: ({ row }) => <Badge variant={statusTone[row.status]} dot>{row.status}</Badge> },
  { key: 'lessons', label: 'Lessons', sortable: true, align: 'end' },
  { key: 'owed', label: 'Owed', sortable: true, align: 'end', format: (v) => (v ? pounds(v as number) : '–') },
]

export default function Students() {
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState<string | null>(null)
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState<TableSort>({ key: 'name', dir: 'asc' })
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<(string | number)[]>([])
  const [open, setOpen] = useState<Student | null>(null)

  // Any change to the filters goes back to the first page.
  const filter = <T,>(set: (value: T) => void) => (value: T) => { set(value); setPage(1) }
  const q = query.trim().toLowerCase()
  const filtered = students.filter((s) => (!q || `${s.name} ${s.email}`.toLowerCase().includes(q))
    && (!subject || s.subject === subject) && (status === 'all' || s.status === status))
  const rows = sortRows(filtered, columns, sort).slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="m-0 text-xl font-bold">Students</h2>
          <p className="mt-1 mb-0 text-sm text-(--ui-muted)">{students.length} students, {students.filter((s) => s.owed).length} with money owed</p>
        </div>
        <Button variant="primary" icon="lucide:user-plus">Add student</Button>
      </div>

      <Card flush>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <Input icon="lucide:search" placeholder="Search by name or email" value={query} onValueChange={filter(setQuery)} className="w-full sm:w-64" />
          <Select items={subjectNames} placeholder="All subjects" clearable value={subject} onValueChange={filter(setSubject)} className="w-44" />
          <Segmented items={statuses} value={status} onValueChange={filter((v: string | null) => setStatus(v ?? 'all'))} className="ml-auto" />
        </div>
        <Table columns={columns} rows={rows} manualSort flush selectable selected={selected} onSelectedChange={setSelected}
          sort={sort} onSortChange={filter(setSort)} onRowClick={setOpen} label="Students"
          emptyText="No students match those filters." />
        <div className="border-t border-(--ui-border) px-4 py-3">
          <Pagination count={filtered.length} pageSize={pageSize} summary noun="students" page={page} onPageChange={setPage} />
        </div>
      </Card>

      <ActionBar open={selected.length > 0} onClose={() => setSelected([])} selection={`${selected.length} selected`}>
        <Button size="sm" icon="lucide:send" onClick={() => toaster.success({ title: `Messaged ${selected.length} students` })}>Message</Button>
        <Button size="sm" icon="lucide:receipt">Invoice</Button>
        <Button size="sm" variant="danger" icon="lucide:archive" onClick={() => setSelected([])}>Archive</Button>
      </ActionBar>

      {/* One sheet for every row: it shows whichever student was clicked. */}
      <Sheet open={!!open} onOpenChange={(next) => !next && setOpen(null)} heading={open?.name} description={open?.email}
        footer={<><Button onClick={() => setOpen(null)}>Close</Button><Button variant="primary" icon="lucide:calendar-plus">Book lesson</Button></>}>
        {open && <div className="flex flex-col gap-6">
          <Stats columns={2}>
            <Stat size="sm" label="Lessons" value={open.lessons} />
            <Stat size="sm" label="Owed" value={open.owed ? pounds(open.owed) : '£0'} />
          </Stats>
          <DataList items={[
            { label: 'Subject', value: open.subject },
            { label: 'Year', value: open.year },
            { label: 'Status', value: <Badge variant={statusTone[open.status]} dot>{open.status}</Badge> },
          ]} labelWidth="6rem" />
          <Timeline size="sm" items={activity.slice(0, 3)} />
        </div>}
      </Sheet>
    </div>
  )
}
