import { afterEach, expect, test } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { AreaChart } from '../src/chart/AreaChart.js'
import { DonutChart } from '../src/chart/DonutChart.js'

afterEach(cleanup)

// jsdom lays nothing out: the charts measure their width with a ResizeObserver, so one that reports 400px at once
globalThis.ResizeObserver = class {
  constructor(private report: () => void) {}
  observe() { this.report() }
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver
Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 400 })

// A table won't shrink below its rows, so the visually hidden box must be a wrapper around it.
test("a chart's data table is hidden inside a wrapper, not hidden itself", () => {
  render(<>
    <AreaChart data={[{ label: 'Jan', value: 1 }, { label: 'Fév', value: 2 }]} y="value" label="Ventes" />
    <DonutChart data={[{ label: 'Chiens', value: 3 }, { label: 'Chats', value: 2 }]} label="Espèces" />
  </>)
  for (const name of ['Ventes', 'Espèces']) {
    const table = screen.getByRole('table', { name })
    expect(table.dataset.part).toBeUndefined()
    expect(table.parentElement?.dataset.part).toBe('sr-only')
  }
})

const ticks = (container: HTMLElement) =>
  [...container.querySelectorAll('[data-part=tick][text-anchor=end]')].map((tick) => tick.textContent)

test('the value axis starts at 0, or fits the values when asked', () => {
  const weights = [{ label: 'a', kg: 4.2 }, { label: 'b', kg: 3.9 }]
  const { container: fromZero } = render(<AreaChart data={weights} y="kg" />)
  expect(ticks(fromZero)[0]).toBe('0')
  cleanup()
  const { container: fitted } = render(<AreaChart data={weights} y="kg" zero={false} />)
  expect(Number(ticks(fitted)[0])).toBeGreaterThan(3)
})

const xsOf = (container: HTMLElement) =>
  [...(container.querySelector('[data-part=line]')?.getAttribute('d') ?? '').matchAll(/[ML]([\d.]+),/g)].map((m) => Number(m[1]))

test('by date, a week apart sits closer than a year apart', () => {
  const weights = [{ date: '2020-01-01', kg: 30 }, { date: '2020-01-08', kg: 31 }, { date: '2021-01-01', kg: 40 }]
  const { container: evenly } = render(<AreaChart data={weights} x="date" y="kg" curve="linear" />)
  const [a, b, c] = xsOf(evenly)
  expect(b - a).toBeCloseTo(c - b)
  cleanup()
  const { container: byDate } = render(<AreaChart data={weights} x="date" y="kg" curve="linear" time />)
  const [d, e, f] = xsOf(byDate)
  expect(e - d).toBeLessThan((f - e) / 20)
})

test('the tooltip is headed as asked, and the axis labelled as asked', () => {
  const weights = [{ date: '2020-01-01', kg: 30 }, { date: '2021-01-01', kg: 40 }]
  const { container } = render(<AreaChart data={weights} x="date" y="kg" time
    formatX={() => 'âge'} tooltipLabel={(row) => `pesé le ${row.date}`} />)
  const axis = [...container.querySelectorAll('[data-part=tick][text-anchor=middle]')].map((tick) => tick.textContent)
  expect(axis.length).toBeGreaterThan(1)
  expect(axis.every((text) => text === 'âge')).toBe(true)
  fireEvent.pointerMove(container.querySelector('[data-part=frame]')!, { clientX: 1000 })
  expect(container.querySelector('[data-part=tooltip-label]')?.textContent).toBe('pesé le 2021-01-01')
})

test('by date, the axis is marked where asked, those outside the dates left out', () => {
  const weights = [{ date: '2020-01-01', kg: 30 }, { date: '2023-01-01', kg: 40 }]
  const { container } = render(<AreaChart data={weights} x="date" y="kg" time
    xTicks={['2019-06-01', '2021-01-01', '2022-01-01']} formatX={(value) => String((value as Date).getFullYear())} />)
  // The value axis' ticks are the ones nudged with dy
  const axis = [...container.querySelectorAll('[data-part=tick]:not([dy])')].map((tick) => tick.textContent)
  expect(axis).toEqual(['2021', '2022'])
})
