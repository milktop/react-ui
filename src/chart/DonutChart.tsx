/**
 * Parts of a whole as a ring (or a pie), with the total (or your text) in the
 * middle, a legend, and the value on hover.
 *
 *   <DonutChart data={[{ label: 'Consults', value: 42 }, { label: 'Surgery', value: 9 }]} />
 *   <DonutChart data={byKind} label="Appointments by kind" center={<strong>51</strong>} format={(v) => `${v}`} />
 *
 * - `data`: `{ label, value, color }` (colours from the theme's
 *   --ui-chart-1…5 by default, or 'accent', 'success', 'danger', any CSS colour)
 * - `size` (160 px), `thickness` (a share of the radius, 0.32; 1 for a pie)
 * - `center`: what the middle shows (the total by default; null for nothing)
 * - `legend`: beside it ('right', default), 'bottom' or false
 * - `format(value)`, for the total, legend and tooltip
 * - `label`: what it shows, for assistive tech (a hidden table of the data)
 */
import { useState, type HTMLAttributes, type ReactNode } from 'react'
import { arc, pie } from 'd3-shape'
import { seriesColor, formatter } from './chart.js'
import { cx, partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './chart.css'

export type DonutSlice = { label: string, value: number, color?: string }

export type DonutChartProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  data?: DonutSlice[]
  size?: number
  thickness?: number
  center?: ReactNode
  legend?: 'right' | 'bottom' | false
  format?: ((value: number) => string) | null
  label?: string
  classes?: Classes<'root' | 'svg' | 'slice' | 'center' | 'legend' | 'legendItem' | 'swatch' | 'tooltip'>
}

export function DonutChart({
  data = [], size = 160, thickness = 0.32, center, legend = 'right', format = null, label = 'Chart', className, classes, ...rest
}: DonutChartProps) {
  const part = partsOf('donut', classes)
  const [hover, setHover] = useState<number | null>(null)
  const fmt = formatter(format)
  const total = data.reduce((sum, slice) => sum + Math.max(0, slice.value), 0)
  const radius = size / 2
  const inner = thickness >= 1 ? 0 : radius * (1 - thickness)
  const slices = pie<DonutSlice>().value((d) => Math.max(0, d.value)).sort(null).padAngle(data.length > 1 && inner > 0 ? 0.012 : 0)(data)
  const shape = arc<(typeof slices)[number]>().innerRadius(inner).outerRadius(radius).cornerRadius(inner > 0 ? 2 : 0)
  const grown = arc<(typeof slices)[number]>().innerRadius(inner).outerRadius(radius + 4).cornerRadius(inner > 0 ? 2 : 0)
  const colorOf = (slice: DonutSlice, i: number) => seriesColor(slice.color, i)
  const shown = hover != null ? data[hover] : null

  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} data-legend={legend || undefined}>
      <div {...part('frame')} style={{ width: size, height: size }}>
        <svg {...part('svg')} width={size} height={size} viewBox={`${-radius - 4} ${-radius - 4} ${size + 8} ${size + 8}`} aria-hidden="true">
          {slices.map((s, i) => (
            <path key={data[i].label} {...part('slice')} d={(hover === i ? grown : shape)(s) ?? ''} fill={colorOf(data[i], i)}
              data-dim={(hover != null && hover !== i) || undefined}
              onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} />
          ))}
        </svg>
        {/* The middle: the hovered slice, or the total (or your text). */}
        {inner > 0 && center !== null && (
          <div {...part('center')}>
            {shown
              ? <><strong>{fmt(shown.value)}</strong><span>{shown.label}</span></>
              : center ?? <><strong>{fmt(total)}</strong><span>Total</span></>}
          </div>
        )}
      </div>
      {legend && (
        <ul {...part('legend')}>
          {data.map((slice, i) => (
            <li key={slice.label} {...part('legend-item')} data-dim={(hover != null && hover !== i) || undefined}
              onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
              <span {...part('swatch')} style={{ background: colorOf(slice, i) }} />
              <span {...part('legend-label')}>{slice.label}</span>
              <span {...part('legend-value')}>{fmt(slice.value)}{total > 0 && <small> {Math.round((slice.value / total) * 100)}%</small>}</span>
            </li>
          ))}
        </ul>
      )}
      <table {...part('sr-only')}>
        <caption>{label}</caption>
        <tbody>{data.map((slice) => <tr key={slice.label}><td>{slice.label}</td><td>{fmt(slice.value)}</td></tr>)}</tbody>
      </table>
    </div>
  )
}
