/**
 * A data table: rows of objects, laid out by `columns`.
 *
 *   <Table columns={columns} rows={students} selectable selected={picked} onSelectedChange={setPicked} />
 *
 *   const columns: TableColumn<Student>[] = [
 *     { key: 'name', label: 'Name', sortable: true, cell: ({ row }) => <strong>{row.name}</strong> },
 *     { key: 'year', label: 'Year', align: 'end', sortable: true },
 *     { key: 'fee', label: 'Fee', format: (v) => `£${v}` },
 *   ]
 *
 * - `rows`: plain objects, one per row
 * - `columns`: what each column shows. `key`: the row property shown (and
 *   sorted by); `label`: the heading; `sortable`; `align`: 'start', 'center'
 *   or 'end'; `width`: any CSS width; `format(value, row)`: turns the value
 *   into text; `value(row)`: computes it instead of `row[key]`; `cell`:
 *   renders the cell, given `{ row, column, value }`
 * - `rowKey`: the property that identifies a row ('id')
 * - `sort`, `defaultSort`: `{ key, dir }` or null; `onSortChange`. Sortable
 *   columns sort when their heading is clicked: ascending, descending, then
 *   off. With `manualSort` rows aren't sorted here: sort them yourself
 *   (`sortRows(list, columns, sort)` before paging, or on a server)
 * - `selectable`: a checkbox per row and a select-all; `selected`,
 *   `defaultSelected`: the selected rows' keys; `onSelectedChange`. Shift-click
 *   a row's checkbox to tick (or clear) the rows between it and the last one
 *   clicked
 * - `loading`: skeleton rows while there are none yet (`loadingRows`, 5),
 *   else dims the rows
 * - `emptyText`, or `empty` (markup), for no rows
 * - `maxHeight`: scrolls the rows under a sticky header
 * - `label`: a caption for assistive tech
 * - `size`: 'sm', 'md' (default) or 'lg' (roomier rows)
 * - `flush`: no border or rounding, to sit edge to edge in a card
 * - `onRowClick`: called with the row when a row is clicked (outside its controls)
 *
 * Or write the <table> yourself as its content, for the look alone (no
 * sorting, selection or loading states); `data-align` on cells works too.
 */
import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type MouseEvent, type ReactNode, type SyntheticEvent } from 'react'
import '../icons.js'
import { Checkbox } from '../checkbox/Checkbox.js'
import { Skeleton } from '../skeleton/Skeleton.js'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './table.css'

type Row = Record<string, unknown>
type Key = string | number

export type TableColumn<T extends object = Row> = {
  key: string
  label?: ReactNode
  sortable?: boolean
  align?: 'start' | 'center' | 'end'
  width?: string
  format?: (value: unknown, row: T) => ReactNode
  value?: (row: T) => unknown
  cell?: (cell: { row: T, column: TableColumn<T>, value: unknown }) => ReactNode
}
export type TableSort = { key: string, dir: 'asc' | 'desc' } | null

export type TableProps<T extends object = Row> = Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> & {
  columns?: TableColumn<T>[]
  rows?: T[]
  rowKey?: string
  selectable?: boolean
  selected?: Key[]
  defaultSelected?: Key[]
  onSelectedChange?: (keys: Key[]) => void
  sort?: TableSort
  defaultSort?: TableSort
  onSortChange?: (sort: TableSort) => void
  manualSort?: boolean
  loading?: boolean
  loadingRows?: number
  emptyText?: ReactNode
  empty?: ReactNode
  maxHeight?: string | null
  label?: string | null
  size?: 'sm' | 'md' | 'lg'
  flush?: boolean
  onRowClick?: (row: T) => void
  classes?: Classes<'root' | 'scroll' | 'table' | 'caption' | 'sort' | 'sortIcon' | 'row' | 'selectCell' | 'empty'>
}

// Numbers by value, everything else as text with numbers in order
// ("Year 2" before "Year 10"); empty values last.
function compare(a: unknown, b: unknown) {
  if (a == b) return 0
  if (a == null || a === '') return 1
  if (b == null || b === '') return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

export const cellValue = <T extends object>(row: T, column: TableColumn<T>) =>
  column.value ? column.value(row) : (row as Row)[column.key]

// A copy of `list` in `sort`'s order. With paging, sort the whole list with
// this (and set `manualSort`), then hand the table one page.
export function sortRows<T extends object>(list: T[] | null | undefined, columns: TableColumn<T>[], sort: TableSort) {
  const column = sort && columns.find((c) => c.key === sort.key)
  if (!column) return list ?? []
  const dir = sort.dir === 'desc' ? -1 : 1
  return [...(list ?? [])].sort((a, b) => compare(cellValue(a, column), cellValue(b, column)) * dir)
}

export function Table<T extends object = Row>({
  columns = [], rows = [], rowKey = 'id', selectable = false, selected: selectedProp, defaultSelected = [], onSelectedChange,
  sort: sortProp, defaultSort = null, onSortChange, manualSort = false, loading = false, loadingRows = 5,
  emptyText: emptyTextProp, empty = null, maxHeight = null, label = null, size = 'md', flush = false, onRowClick,
  className, classes, children, ...rest
}: TableProps<T>) {
  const t = useMessages()
  const emptyText = emptyTextProp ?? t.table.empty
  const part = partsOf('table', classes)
  const [sort, setSort] = useControllable<TableSort>(sortProp, defaultSort, onSortChange)
  const [selected, setSelected] = useControllable<Key[]>(selectedProp, defaultSelected, onSelectedChange)
  // The latest selection, so two changes before a render stack.
  const latest = useRef(selected)
  useEffect(() => { latest.current = selected })

  const keyOf = (row: T) => (row as Row)[rowKey] as Key
  const display = (row: T, column: TableColumn<T>) => {
    const value = cellValue(row, column)
    return column.format ? column.format(value, row) : ((value ?? '') as ReactNode)
  }
  const sortedRows = manualSort ? rows : sortRows(rows, columns, sort)

  const sortDir = (column: TableColumn<T>) => (sort && sort.key === column.key ? sort.dir : null)
  function toggleSort(column: TableColumn<T>) {
    const current = sortDir(column)
    setSort(current == null ? { key: column.key, dir: 'asc' } : current === 'asc' ? { key: column.key, dir: 'desc' } : null)
  }
  const ariaSort = (column: TableColumn<T>) => {
    if (!column.sortable) return undefined
    const dir = sortDir(column)
    return dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'
  }

  const isSelected = (row: T) => selected.includes(keyOf(row))
  const selectedCount = rows.filter(isSelected).length
  const allState = selectedCount === 0 ? false : selectedCount === rows.length ? true : 'indeterminate'

  // Change events don't carry the Shift key, so it's noted on the way in;
  // Shift+mousedown would also select the text between.
  const shift = useRef(false)
  const anchorKey = useRef<Key | null>(null)
  function noteShift(e: SyntheticEvent) {
    const event = e.nativeEvent as MouseEvent['nativeEvent'] | KeyboardEvent
    shift.current = event.shiftKey
    if (event.shiftKey && e.type === 'mousedown' && (e.target as Element).closest('[data-part=select-cell]')) e.preventDefault()
  }

  function toggleRow(row: T, on: boolean) {
    const index = sortedRows.indexOf(row)
    const anchor = sortedRows.findIndex((r) => keyOf(r) === anchorKey.current)
    anchorKey.current = keyOf(row)
    // With Shift, every row from the last one clicked to this one.
    const range = shift.current && anchor >= 0 && anchor !== index
      ? sortedRows.slice(Math.min(anchor, index), Math.max(anchor, index) + 1) : [row]
    const keys = range.map(keyOf)
    const others = latest.current.filter((key) => !keys.includes(key))
    latest.current = on ? [...others, ...keys] : others
    setSelected(latest.current)
  }

  function toggleAll(on: boolean) {
    const keys = rows.map(keyOf)
    const others = latest.current.filter((key) => !keys.includes(key))
    latest.current = on ? [...others, ...keys] : others
    setSelected(latest.current)
  }

  // Not when the click was on a control in the row (a link, a menu…); only
  // the row's own contents count, not what the table sits in (a Card).
  function rowClicked(e: MouseEvent, row: T) {
    const control = (e.target as Element).closest('a, button, input, label, select, textarea, [data-scope]:not([data-scope=table])')
    if (control && e.currentTarget.contains(control)) return
    onRowClick?.(row)
  }

  const columnCount = columns.length + (selectable ? 1 : 0)
  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} data-size={size} data-flush={flush || undefined}
      data-loading={(loading && rows.length > 0) || undefined}>
      <div {...part('scroll')} data-sticky={maxHeight ? '' : undefined} style={maxHeight ? { maxHeight } as CSSProperties : undefined}>
        {!columns.length ? children : (
          <table {...part('table')} aria-busy={loading}>
            {label && <caption {...part('caption')}>{label}</caption>}
            <thead>
              <tr>
                {selectable && (
                  <th {...part('select-cell')} scope="col">
                    <Checkbox label={t.table.selectAll} labelHidden disabled={!rows.length} checked={allState}
                      onCheckedChange={(on) => toggleAll(on)} />
                  </th>
                )}
                {columns.map((column) => (
                  <th key={column.key} scope="col" data-align={column.align ?? 'start'} aria-sort={ariaSort(column)}
                    style={column.width ? { width: column.width } : undefined}>
                    {column.sortable
                      ? <button {...part('sort')} type="button" data-dir={sortDir(column) ?? undefined} onClick={() => toggleSort(column)}>
                          <span>{column.label}</span>
                          <span {...part('sort-icon')}><iconify-icon icon={sortDir(column) === 'asc' ? 'lucide:chevron-up'
                            : sortDir(column) === 'desc' ? 'lucide:chevron-down' : 'lucide:chevrons-up-down'} /></span>
                        </button>
                      : column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody onPointerDownCapture={noteShift} onMouseDownCapture={noteShift} onKeyDownCapture={noteShift}>
              {loading && !rows.length
                ? Array.from({ length: loadingRows }, (_, i) => (
                    <tr key={i}>
                      {selectable && <td {...part('select-cell')} />}
                      {columns.map((column) => <td key={column.key}><Skeleton height="0.75rem" width="60%" /></td>)}
                    </tr>
                  ))
                : !rows.length
                  ? <tr><td {...part('empty')} colSpan={columnCount}>{empty ?? emptyText}</td></tr>
                  : sortedRows.map((row) => (
                      <tr key={keyOf(row)} {...part('row')} data-selected={isSelected(row) || undefined}
                        aria-selected={selectable ? isSelected(row) : undefined} onClick={(e) => rowClicked(e, row)}>
                        {selectable && (
                          <td {...part('select-cell')}>
                            <Checkbox label={<>{t.table.selectRow} {display(row, columns[0])}</>} labelHidden checked={isSelected(row)}
                              onCheckedChange={(on) => toggleRow(row, on)} />
                          </td>
                        )}
                        {columns.map((column) => (
                          <td key={column.key} data-align={column.align ?? 'start'}>
                            {column.cell ? column.cell({ row, column, value: cellValue(row, column) }) : display(row, column)}
                          </td>
                        ))}
                      </tr>
                    ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
