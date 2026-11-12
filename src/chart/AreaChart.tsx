/**
 * A filled line chart, drawn to its width, with a tooltip on hover.
 *
 *   <AreaChart data={months} x="month" y="revenue" format={(v) => `£${v}`} />
 *   <AreaChart data={months} x="month" series={[{ key: 'maths', label: 'Maths' }, { key: 'english', label: 'English' }]} />
 *
 * - `data`: rows of objects; `x` names the label property ('label')
 * - `y`: the value property, or `series` for several, each `{ key, label, color }`
 *   (colours from the theme's --ui-chart-1…5 by default)
 * - `curve`: 'smooth' (default) or 'linear'; `stacked`: series sit on top of one another
 * - `zero`: the value axis starts at 0 (default); false fits it to the values, so a small change
 *   on a large value shows (a weight); stacked charts always start at 0
 * - `time`: `x` holds dates (Date, or '2024-03-08'), rows in date order: each point sits by its
 *   date, so a year's gap looks like one, and the axis is marked in months and years
 * - `formatX(value)`: the axis' labels (a Date when `time`); `tooltipLabel(row)`: the tooltip's heading
 * - `height` (240 px), `format(value)` for ticks and tooltips, `grid` (lines; true)
 * - `label`: what it shows, for assistive tech (a hidden table of the data)
 */
import { useLocale, useMessages } from '../format/LocaleProvider.js'
import { useId, useState, type HTMLAttributes, type PointerEvent } from 'react'
import { scalePoint, scaleTime } from 'd3-scale'
import { area, line, curveMonotoneX, curveLinear } from 'd3-shape'
import { ChartFrame, type ChartClasses } from './ChartFrame.js'
import { seriesOf, formatter, pad, yScale, fitScale, leftFor, labelStep, num, toDate, type ChartRow, type ChartSeries } from './chart.js'
import { partsOf } from '../utils.js'

export type ChartProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  data?: ChartRow[]
  x?: string
  y?: string | null
  series?: ChartSeries[] | null
  height?: number
  format?: ((value: number) => string) | null
  label?: string
  grid?: boolean
  stacked?: boolean
  classes?: ChartClasses
}

export type AreaChartProps = ChartProps & {
  curve?: 'smooth' | 'linear'
  zero?: boolean
  time?: boolean
  formatX?: ((value: unknown) => string) | null
  tooltipLabel?: ((row: ChartRow) => string) | null
}

type Band = [number, number]

export function AreaChart({
  data = [], x = 'label', y = null, series = null, height = 240, format = null, label: labelProp, grid = true,
  curve = 'smooth', stacked = false, zero = true, time = false, formatX = null, tooltipLabel = null, classes, ...rest
}: AreaChartProps) {
  const t = useMessages()
  const label = labelProp ?? t.chart.label
  const part = partsOf('chart', classes)
  // Safe inside url(#…), whatever React's ids look like.
  const id = useId().replace(/[^\w-]/g, '')
  const [hover, setHover] = useState<number | null>(null)
  const [width, setWidth] = useState(0)

  const rows = data ?? []
  const list = seriesOf(series, y)
  const locale = useLocale()
  const fmt = formatter(format, locale)
  const innerH = Math.max(0, height - pad.top - pad.bottom)

  // Each series' [low, high] per row: from 0, or stacked on the ones before.
  const base = rows.map(() => 0)
  const bands: Band[][] = list.map((s) => rows.map((row, i) => {
    const value = num(row[s.key])
    const low = stacked ? base[i] : 0
    if (stacked) base[i] = low + value
    return [low, low + value]
  }))

  const highs = bands.flatMap((b) => b.map((v) => v[1]))
  const fitted = !zero && !stacked && highs.length > 0
  const ys = fitted ? fitScale(Math.min(...highs), Math.max(...highs), innerH) : yScale(Math.max(0, ...highs), innerH)
  const ticks = ys.ticks(4)
  const left = leftFor(ticks, fmt)
  const innerW = Math.max(0, width - left - pad.right)
  const dates = time ? rows.map((row) => toDate(row[x])) : []
  const byDate = scaleTime().domain([dates[0] ?? new Date(), dates[dates.length - 1] ?? new Date()]).range([0, innerW])
  const evenly = scalePoint<number>().domain(rows.map((_, i) => i)).range([0, innerW])
  const at = (i: number) => (time ? byDate(dates[i]) : evenly(i)) ?? 0
  const tickLabel = formatX ?? (time
    ? (value: unknown) => toDate(value).toLocaleDateString(locale, { month: 'short', year: 'numeric' })
    : (value: unknown) => String(value ?? ''))
  const labelOf = tooltipLabel ?? ((row: ChartRow) => time ? toDate(row[x]).toLocaleDateString(locale, { dateStyle: 'medium' }) : tickLabel(row[x]))
  // About one date every 80px, on whole months and years
  const timeTicks = time && rows.length > 1 ? byDate.ticks(Math.max(2, Math.floor(innerW / 80))) : []
  const shape = curve === 'linear' ? curveLinear : curveMonotoneX
  // Fitted, the fill runs down to the axis' foot rather than to 0, which is off the chart
  const fill = area<Band>().x((_, i) => at(i)).y0((d) => (fitted ? innerH : ys(d[0]))).y1((d) => ys(d[1])).curve(shape)
  const stroke = line<Band>().x((_, i) => at(i)).y((d) => ys(d[1])).curve(shape)
  const step = labelStep(rows.length, innerW)

  function move(e: PointerEvent<HTMLDivElement>) {
    if (!rows.length) return
    const pos = e.clientX - e.currentTarget.getBoundingClientRect().left - left
    // The nearest point, as they aren't evenly spaced when placed by date
    let nearest = 0
    rows.forEach((_, i) => { if (Math.abs(at(i) - pos) < Math.abs(at(nearest) - pos)) nearest = i })
    setHover(nearest)
  }

  return (
    <ChartFrame {...rest} rows={rows} x={x} labelOf={labelOf} list={list} fmt={fmt} height={height} label={label} classes={classes}
      hover={hover} onHover={setHover} onMove={move} width={width} onWidth={setWidth}
      tipLeft={hover == null ? 0 : left + at(hover)} flip={hover != null && at(hover) > innerW * 0.6}>
      <svg {...part('svg')} width={width} height={height} aria-hidden="true">
        <defs>
          {list.map((s, i) => (
            <linearGradient key={s.key} id={`${id}-${i}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>
        <g transform={`translate(${left},${pad.top})`}>
          {ticks.map((tick) => (
            <g key={tick}>
              {grid && <line {...part('grid')} x1="0" x2={innerW} y1={ys(tick)} y2={ys(tick)} />}
              <text {...part('tick')} x="-8" y={ys(tick)} dy="0.32em" textAnchor="end">{fmt(tick)}</text>
            </g>
          ))}
          {time ? timeTicks.map((tick) => (
            <text key={+tick} {...part('tick')} x={byDate(tick)} y={innerH + 18} textAnchor="middle">{tickLabel(tick)}</text>
          )) : rows.map((row, i) => i % step === 0 && (
            <text key={i} {...part('tick')} x={at(i)} y={innerH + 18}
              textAnchor={i === 0 ? 'start' : i === rows.length - 1 ? 'end' : 'middle'}>{tickLabel(row[x])}</text>
          ))}
          {list.map((s, i) => (
            <g key={s.key}>
              <path {...part('area')} d={fill(bands[i]) ?? ''} fill={`url(#${id}-${i})`} />
              <path {...part('line')} d={stroke(bands[i]) ?? ''} stroke={s.color} />
            </g>
          ))}
          {hover != null && <>
            <line {...part('cursor')} x1={at(hover)} x2={at(hover)} y1="0" y2={innerH} />
            {list.map((s, i) => <circle key={s.key} {...part('dot')} cx={at(hover)} cy={ys(bands[i][hover][1])} r="4" fill={s.color} />)}
          </>}
        </g>
      </svg>
    </ChartFrame>
  )
}
