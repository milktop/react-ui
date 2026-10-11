/**
 * Previous and next buttons and page numbers, with ellipses for long runs.
 *
 *   <Pagination count={students.length} pageSize={10} page={page} onPageChange={setPage} />
 *   {students.slice((page - 1) * 10, page * 10).map(…)}
 *
 * - `count`: the number of items; `pageSize` per page (10)
 * - `page`, `defaultPage`: the current page, from 1; `onPageChange`: called
 *   with the new one. Past the last page (after filtering), it goes to the
 *   last one
 * - `siblingCount`: pages shown either side of the current one (1)
 * - `summary`: shows "Showing 11–20 of 95 items" alongside
 * - `noun`: what the items are called in the summary ('items')
 * - `firstLast`: buttons for the first and last page, shown when some pages
 *   are hidden behind an ellipsis (false to never show them)
 * - `label`: the nav's accessible name
 *
 * By hand, Ark's parts are here too: Pagination.Root, PrevTrigger, Item,
 * Ellipsis, NextTrigger, FirstTrigger, LastTrigger, Context.
 */
import { useEffect } from 'react'
import { Pagination as Ark, usePagination } from '@ark-ui/react/pagination'
import 'iconify-icon'
import { cx, partsOf, useControllable, withParts, type Classes } from '../utils.js'
import { useLocale, useMessages } from '../format/LocaleProvider.js'
import { formatNumber } from '../format/format.js'
import '../theme.css'
import './pagination.css'

export type PaginationProps = Omit<Ark.RootProviderProps, 'value' | 'children'> & {
  count?: number
  pageSize?: number
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  siblingCount?: number
  summary?: boolean
  noun?: string
  firstLast?: boolean
  label?: string
  classes?: Classes<'root' | 'summary' | 'pages' | 'item' | 'ellipsis' | 'firstTrigger' | 'prevTrigger' | 'nextTrigger' | 'lastTrigger'>
}

function PaginationShortcut({
  count = 0, pageSize = 10, page: pageProp, defaultPage = 1, onPageChange, siblingCount = 1, summary = false, noun: nounProp,
  firstLast = true, label: labelProp, className, classes, ...rest
}: PaginationProps) {
  const t = useMessages()
  const locale = useLocale()
  const noun = nounProp ?? t.pagination.noun
  const label = labelProp ?? t.pagination.label
  const fmt = (n: number) => formatNumber(n, { locale })
  const part = partsOf('pagination', classes)
  const [current, setPage] = useControllable(pageProp, defaultPage, onPageChange)
  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  const page = Math.min(Math.max(1, current), totalPages)

  // Past the last page (the list shrank): move to it.
  useEffect(() => { if (current > totalPages) setPage(totalPages) }, [current, totalPages, setPage])

  const api = usePagination({
    count, pageSize, siblingCount, page, type: 'button', onPageChange: (details) => setPage(details.page),
    ...(t.zag.pagination && { translations: t.zag.pagination }),
  })
  const from = count ? (page - 1) * pageSize + 1 : 0
  const to = Math.min(page * pageSize, count)
  // First and last only help when some page numbers are hidden.
  const edges = firstLast && api.pages.some((item) => item.type === 'ellipsis')

  return (
    <Ark.RootProvider value={api} {...rest} {...part('root')} className={cx(className, classes?.root)} aria-label={label}>
      {summary && <span {...part('summary')}>{t.pagination.showing(fmt(from), fmt(to), fmt(count), noun)}</span>}
      <div {...part('pages')}>
        {edges && <Ark.FirstTrigger {...part('first-trigger')}><iconify-icon icon="lucide:chevrons-left" /></Ark.FirstTrigger>}
        <Ark.PrevTrigger {...part('prev-trigger')}><iconify-icon icon="lucide:chevron-left" /></Ark.PrevTrigger>
        {api.pages.map((item, i) => item.type === 'page'
          ? <Ark.Item key={i} {...item} {...part('item')}>{item.value}</Ark.Item>
          : <Ark.Ellipsis key={i} index={i} {...part('ellipsis')}>…</Ark.Ellipsis>)}
        <Ark.NextTrigger {...part('next-trigger')}><iconify-icon icon="lucide:chevron-right" /></Ark.NextTrigger>
        {edges && <Ark.LastTrigger {...part('last-trigger')}><iconify-icon icon="lucide:chevrons-right" /></Ark.LastTrigger>}
      </div>
    </Ark.RootProvider>
  )
}

export const Pagination = withParts(PaginationShortcut, {
  Root: Ark.Root, RootProvider: Ark.RootProvider, Item: Ark.Item, Ellipsis: Ark.Ellipsis, PrevTrigger: Ark.PrevTrigger,
  NextTrigger: Ark.NextTrigger, FirstTrigger: Ark.FirstTrigger, LastTrigger: Ark.LastTrigger, Context: Ark.Context,
})
