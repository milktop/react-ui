// Layers: every overlay opened from inside another, one pair at a time (#/layers?outer=dialog&inner=select):
// each should open on top, work, and close (Escape, a click beside it) without taking the outer one along.
import { useState } from 'react'
import {
  Button, confirm, DatePicker, DateRangeFilter, Dialog, HoverCard, Menu, Popover, Select, Sheet, toaster, Tooltip,
} from '@milktop/react-ui'

const outers = ['page', 'dialog', 'sheet', 'sheet-free', 'popover', 'dialog-popover', 'sheet-popover', 'menu', 'dialog-menu'] as const
const inners = ['select', 'search', 'date', 'range', 'range-filter', 'menu', 'popover', 'tooltip', 'hover-card', 'confirm', 'toast'] as const
type Outer = typeof outers[number]
type Inner = typeof inners[number]

const fruits = ['Apple', 'Banana', 'Cherry', 'Damson', 'Elderberry', 'Fig', 'Grape'].map((label) => ({ value: label.toLowerCase(), label }))
const inMenu = (outer: Outer) => outer === 'menu' || outer === 'dialog-menu'
const fits = (outer: Outer, inner: Inner) => !inMenu(outer) || ['menu', 'tooltip', 'hover-card', 'confirm', 'toast'].includes(inner)

type Log = (line: string) => void

function InnerControl({ inner, log }: { inner: Inner, log: Log }) {
  const trigger = <Button data-inner-trigger="">Inner {inner}</Button>
  switch (inner) {
    case 'select': return <Select label="Inner select" items={fruits} onValueChange={(v) => log(`select ${v}`)} />
    case 'search': return <Select label="Inner search" searchable items={fruits} onValueChange={(v) => log(`search ${v}`)} />
    case 'date': return <DatePicker label="Inner date" onValueChange={(v) => log(`date ${v}`)} />
    case 'range': return <DatePicker label="Inner range" range onValueChange={(v) => log(`range ${v}`)} />
    case 'range-filter': return <DateRangeFilter onValueChange={(v) => log(`range-filter ${v}`)} />
    case 'menu': return <Menu trigger={trigger} items={fruits} onSelect={(v) => log(`menu ${v}`)} />
    case 'popover': return (
      <Popover trigger={trigger} heading="Inner popover">
        <Button onClick={() => log('popover button')}>Inside</Button>
      </Popover>
    )
    case 'tooltip': return <Tooltip content="Inner tooltip">{trigger}</Tooltip>
    case 'hover-card': return <HoverCard trigger={trigger}><p className="m-0">Inner hover card</p></HoverCard>
    case 'confirm': return <Button data-inner-trigger="" onClick={async () => log(`confirm ${await confirm({ heading: 'Inner confirm' })}`)}>Inner confirm</Button>
    case 'toast': return <Button data-inner-trigger="" onClick={() => toast(log)}>Inner toast</Button>
  }
}

function toast(log: Log) {
  toaster.create({ title: 'Inner toast', duration: 60000, action: { label: 'Undo', onClick: () => log('toast action') } })
}

// Inside a menu: the inner one hangs off an item.
function MenuEntries({ inner, log }: { inner: Inner, log: Log }) {
  switch (inner) {
    case 'menu': return (
      <Menu.Submenu label="Inner submenu">
        {fruits.map((fruit) => <Menu.Item key={fruit.value} value={`sub-${fruit.value}`}>{fruit.label}</Menu.Item>)}
      </Menu.Submenu>
    )
    case 'tooltip': return <Tooltip content="Inner tooltip"><Menu.Item value="tip">Inner tooltip</Menu.Item></Tooltip>
    case 'hover-card': return <HoverCard trigger={<Menu.Item value="card">Inner hover card</Menu.Item>}><p className="m-0">Inner hover card</p></HoverCard>
    case 'confirm': return <Menu.Item value="confirm" onClick={async () => log(`confirm ${await confirm({ heading: 'Inner confirm' })}`)}>Inner confirm</Menu.Item>
    case 'toast': return <Menu.Item value="toast" onClick={() => toast(log)}>Inner toast</Menu.Item>
    default: return null
  }
}

function OuterLayer({ outer, inner, log }: { outer: Outer, inner: Inner, log: Log }) {
  const trigger = <Button data-outer-trigger="">Outer {outer}</Button>
  const body = <div data-outer-body="" className="flex flex-col items-start gap-3">
    <InnerControl inner={inner} log={log} />
    <Button data-outer-button="" onClick={() => log('outer button')}>Outer button</Button>
  </div>
  const menu = (
    <Menu trigger={inMenu(outer) && outer === 'menu' ? trigger : <Button data-mid-trigger="">Middle menu</Button>} onSelect={(v) => log(`outer menu ${v}`)}>
      <Menu.Item value="first">First</Menu.Item>
      <MenuEntries inner={inner} log={log} />
      <Menu.Item value="last">Last</Menu.Item>
    </Menu>
  )
  const popover = (
    <Popover trigger={outer === 'popover' ? trigger : <Button data-mid-trigger="">Middle popover</Button>} heading="Popover">{body}</Popover>
  )
  switch (outer) {
    case 'page': return body
    case 'dialog': return <Dialog trigger={trigger} heading="Dialog">{body}</Dialog>
    case 'sheet': return <Sheet trigger={trigger} heading="Sheet">{body}</Sheet>
    case 'sheet-free': return <Sheet modal={false} trigger={trigger} heading="Sheet (not modal)">{body}</Sheet>
    case 'popover': return popover
    case 'dialog-popover': return <Dialog trigger={trigger} heading="Dialog">{popover}</Dialog>
    case 'sheet-popover': return <Sheet trigger={trigger} heading="Sheet">{popover}</Sheet>
    case 'menu': return menu
    case 'dialog-menu': return <Dialog trigger={trigger} heading="Dialog">{menu}</Dialog>
  }
}

export function Layers({ query }: { query: URLSearchParams }) {
  const outer = (outers as readonly string[]).includes(query.get('outer') ?? '') ? query.get('outer') as Outer : 'dialog'
  const inner = (inners as readonly string[]).includes(query.get('inner') ?? '') ? query.get('inner') as Inner : 'select'
  const [lines, setLines] = useState<string[]>([])
  const log = (line: string) => setLines((all) => [...all, line])

  return (
    <div className="flex flex-col gap-6">
      <table className="border-collapse text-sm">
        <thead><tr><th />{inners.map((name) => <th key={name} className="px-1 font-medium">{name}</th>)}</tr></thead>
        <tbody>
          {outers.map((row) => (
            <tr key={row}>
              <th className="pr-2 text-left font-medium">{row}</th>
              {inners.map((name) => <td key={name} className="px-1 text-center">
                {fits(row, name) ? <a href={`#/layers?outer=${row}&inner=${name}`} aria-current={row === outer && name === inner}
                  className="aria-[current=true]:font-bold">●</a> : '·'}
              </td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <div key={`${outer}-${inner}`} className="flex items-center gap-3">
        <OuterLayer outer={outer} inner={inner} log={log} />
        <Button data-page-button="" onClick={() => log('page button')}>Page button</Button>
      </div>
      <pre data-log="" className="m-0 text-xs">{lines.join('\n')}</pre>
    </div>
  )
}

