/**
 * Vertical bars, one per row (or a group per row for several series), drawn
 * to its width, with a tooltip on hover.
 *
 *   <BarChart data={weeks} x="week" y="lessons" />
 *   <BarChart data={months} x="month" series={subjects} stacked />
 *
 * - `data`, `x`, `y`, `series`, `height`, `format`, `grid`, `label`: as for AreaChart
 * - `stacked`: series sit on top of one another instead of side by side
 */
import { useLocale } from '../format/LocaleProvider.js'
import { useState, type PointerEvent } from 'react'
import { scaleBand } from 'd3-scale'
import { ChartFrame } from './ChartFrame.js'
import { seriesOf, formatter, pad, yScale, leftFor, labelStep, num, type ChartRow } from './chart.js'
import type { ChartProps } from './AreaChart.js'
import { partsOf } from '../utils.js'

export type BarChartProps = ChartProps

export function BarChart({
  data = [], x = 'label', y = null, series = null, height = 240, format = null, label = 'Chart', grid = true,
  stacked = false, classes, ...rest
}: BarChartProps) {
  const part = partsOf('chart', classes)
  const [hover, setHover] = useState<number | null>(null)
  const [width, setWidth] = useState(0)

  const rows = data ?? []
  const list = seriesOf(series, y)
  const fmt = formatter(format, useLocale())
  const innerH = Math.max(0, height - pad.top - pad.bottom)
  const sum = (row: ChartRow) => list.reduce((total, s) => total + num(row[s.key]), 0)
  const max = Math.max(0, ...rows.map((row) => (stacked ? sum(row) : Math.max(0, ...list.map((s) => num(row[s.key]))))))
  const ys = yScale(max, innerH)
  const ticks = ys.ticks(4)
  const left = leftFor(ticks, fmt)
  const innerW = Math.max(0, width - left - pad.right)
  const xs = scaleBand<number>().domain(rows.map((_, i) => i)).range([0, innerW]).padding(0.3)
  const at = (i: number) => xs(i) ?? 0
  const inner = scaleBand<string>().domain(list.map((s) => s.key)).range([0, xs.bandwidth()]).padding(0.12)
  const step = labelStep(rows.length, innerW)

  // Each bar's box: side by side, or stacked.
  const bars = rows.map((row, i) => {
    let base = 0
    return list.map((s) => {
      const value = num(row[s.key])
      const low = stacked ? base : 0
      if (stacked) base += value
      return {
        key: s.key, x: stacked ? at(i) : at(i) + (inner(s.key) ?? 0), y: ys(low + value), color: s.color,
        w: stacked ? xs.bandwidth() : inner.bandwidth(), h: Math.max(0, ys(low) - ys(low + value)),
      }
    })
  })

  function move(e: PointerEvent<HTMLDivElement>) {
    if (!rows.length) return
    const pos = e.clientX - e.currentTarget.getBoundingClientRect().left - left
    setHover(Math.max(0, Math.min(rows.length - 1, Math.floor(pos / (innerW / rows.length)))))
  }

  const flip = hover != null && at(hover) > innerW * 0.6
  return (
    <ChartFrame {...rest} rows={rows} x={x} list={list} fmt={fmt} height={height} label={label} classes={classes}
      hover={hover} onHover={setHover} onMove={move} width={width} onWidth={setWidth}
      tipLeft={hover == null ? 0 : left + at(hover) + (flip ? 0 : xs.bandwidth())} flip={flip}>
      <svg {...part('svg')} width={width} height={height} aria-hidden="true">
        <g transform={`translate(${left},${pad.top})`}>
          {ticks.map((tick) => (
            <g key={tick}>
              {grid && <line {...part('grid')} x1="0" x2={innerW} y1={ys(tick)} y2={ys(tick)} />}
              <text {...part('tick')} x="-8" y={ys(tick)} dy="0.32em" textAnchor="end">{fmt(tick)}</text>
            </g>
          ))}
          {hover != null && (
            <rect {...part('band')} x={at(hover) - (xs.step() * xs.paddingInner()) / 2} y="0" width={xs.step()} height={innerH} />
          )}
          {rows.map((row, i) => (
            <g key={i}>
              {i % step === 0 && <text {...part('tick')} x={at(i) + xs.bandwidth() / 2} y={innerH + 18} textAnchor="middle">{String(row[x] ?? '')}</text>}
              {bars[i].map((bar) => (
                <rect key={bar.key} {...part('bar')} x={bar.x} y={bar.y} width={bar.w} height={bar.h} rx={stacked ? 0 : 3} fill={bar.color}
                  data-dim={(hover != null && hover !== i) || undefined} />
              ))}
            </g>
          ))}
        </g>
      </svg>
    </ChartFrame>
  )
}
