/**
 * A tiny chart without axes, for a trend beside a number or in a table cell.
 *
 *   <Sparkline data={[3, 5, 4, 8, 6, 9]} />
 *   <Sparkline data={months} y="revenue" variant="area" color="success" />
 *
 * - `data`: numbers (or objects, with `y` naming the value)
 * - `variant`: 'line' (default), 'area' or 'bar'
 * - `color`, `height` (px, 32; it fills its width)
 * - `label`: what it shows, for assistive tech
 */
import { useId, type HTMLAttributes } from 'react'
import { scaleLinear, scaleBand } from 'd3-scale'
import { area, line, curveMonotoneX } from 'd3-shape'
import { seriesColor, num, type ChartRow } from './chart.js'
import { cx, partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './chart.css'

export type SparklineProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'> & {
  data?: (number | ChartRow)[]
  y?: string | null
  variant?: 'line' | 'area' | 'bar'
  color?: string | null
  height?: number
  label?: string | null
  classes?: Classes<'root' | 'svg' | 'line'>
}

export function Sparkline({
  data = [], y = null, variant = 'line', color = null, height = 32, label = null, className, classes, style, ...rest
}: SparklineProps) {
  const part = partsOf('sparkline', classes)
  const id = useId().replace(/[^\w-]/g, '')

  // Drawn in a 100-wide box stretched to fit; strokes keep their width.
  const values = (data ?? []).map((d) => num(y && typeof d === 'object' ? d[y] : d))
  const max = Math.max(...values, 0)
  const min = variant === 'bar' ? 0 : Math.min(...values, max)
  const ys = scaleLinear().domain([min, max === min ? min + 1 : max]).range([height - 2, 2])
  const xs = scaleLinear().domain([0, Math.max(1, values.length - 1)]).range([1, 99])
  const colour = seriesColor(color, 0)
  const path = line<number>().x((_, i) => xs(i)).y((v) => ys(v)).curve(curveMonotoneX)
  const fill = area<number>().x((_, i) => xs(i)).y0(height).y1((v) => ys(v)).curve(curveMonotoneX)
  const band = scaleBand<number>().domain(values.map((_, i) => i)).range([0, 100]).padding(0.25)

  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} role="img" aria-label={label ?? `Trend: ${values.join(', ')}`}
      style={{ ...style, height }}>
      <svg {...part('svg')} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden="true">
        {variant === 'bar'
          ? values.map((value, i) => (
              <rect key={i} x={band(i)} y={ys(value)} width={band.bandwidth()} height={Math.max(0, height - ys(value))} fill={colour} rx="0.5" />
            ))
          : <>
              {variant === 'area' && <>
                <defs>
                  <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={colour} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={colour} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={fill(values) ?? ''} fill={`url(#${id})`} />
              </>}
              <path {...part('line')} d={path(values) ?? ''} fill="none" stroke={colour} />
            </>}
      </svg>
    </div>
  )
}
