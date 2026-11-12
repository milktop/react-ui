import { afterEach, expect, test } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
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
