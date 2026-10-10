// What area and bar charts share: the measured frame, the hover tooltip,
// the legend and a table of the data for assistive tech. Internal.
import { useEffect, useRef, type HTMLAttributes, type PointerEvent, type ReactNode } from 'react'
import { cx, partsOf, type Classes } from '../utils.js'
import type { ChartRow, Series } from './chart.js'
import '../theme.css'
import './chart.css'

export type ChartClasses = Classes<'root' | 'frame' | 'svg' | 'grid' | 'tick' | 'area' | 'line' | 'cursor' | 'dot' | 'bar' | 'band'
  | 'tooltip' | 'tooltipLabel' | 'tooltipRow' | 'tooltipName' | 'tooltipValue' | 'swatch' | 'legend' | 'legendItem'>

type FrameProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  rows: ChartRow[]
  x: string
  list: Series[]
  fmt: (value: unknown) => string
  height: number
  label: string
  hover: number | null
  onHover: (index: number | null) => void
  onMove: (e: PointerEvent<HTMLDivElement>) => void
  tipLeft: number
  flip: boolean
  classes?: ChartClasses
  // The frame's measured width, which the chart draws to.
  width: number
  onWidth: (width: number) => void
  children: ReactNode
}

export function ChartFrame({
  rows, x, list, fmt, height, label, hover, onHover, onMove, tipLeft, flip, width, onWidth, className, classes, children, ...rest
}: FrameProps) {
  const part = partsOf('chart', classes)
  const frame = useRef<HTMLDivElement>(null)
  const latest = useRef(onWidth)
  useEffect(() => { latest.current = onWidth })
  useEffect(() => {
    const el = frame.current
    if (!el) return
    const observer = new ResizeObserver(() => latest.current(el.clientWidth))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)}>
      <div {...part('frame')} ref={frame} style={{ height }} onPointerMove={onMove} onPointerLeave={() => onHover(null)} role="presentation">
        {width > 0 && children}
        {hover != null && rows[hover] && (
          <div {...part('tooltip')} data-flip={flip || undefined} style={{ left: tipLeft }}>
            <div {...part('tooltip-label')}>{String(rows[hover][x] ?? '')}</div>
            {list.map((s) => (
              <div key={s.key} {...part('tooltip-row')}>
                <span {...part('swatch')} style={{ background: s.color }} />
                <span {...part('tooltip-name')}>{s.label}</span>
                <span {...part('tooltip-value')}>{fmt(rows[hover][s.key])}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {list.length > 1 && (
        <div {...part('legend')}>
          {list.map((s) => <span key={s.key} {...part('legend-item')}><span {...part('swatch')} style={{ background: s.color }} />{s.label}</span>)}
        </div>
      )}
      <table {...part('sr-only')}>
        <caption>{label}</caption>
        <tbody>
          <tr><th>{x}</th>{list.map((s) => <th key={s.key}>{s.label}</th>)}</tr>
          {rows.map((row, i) => <tr key={i}><td>{String(row[x] ?? '')}</td>{list.map((s) => <td key={s.key}>{fmt(row[s.key])}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  )
}
