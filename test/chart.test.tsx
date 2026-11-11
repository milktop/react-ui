import { afterEach, expect, test } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { AreaChart } from '../src/chart/AreaChart.js'
import { DonutChart } from '../src/chart/DonutChart.js'

afterEach(cleanup)

// jsdom has none; the charts measure their width with one
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver

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
