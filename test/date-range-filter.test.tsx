import { useState } from 'react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateRangeFilter, type DateRangeFilterProps } from '../src/date-range-filter/DateRangeFilter.js'

// jsdom has none; the popover's positioning wants one.
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }

// Only Date: Zag's animation frames and timers stay real.
beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(2026, 10, 12, 10)) })
afterEach(() => { cleanup(); vi.useRealTimers() })

let reported: string[][] = []

function Controlled(props: DateRangeFilterProps) {
  const [dates, setDates] = useState<string[]>(props.value ?? [])
  return <DateRangeFilter {...props} value={dates} onValueChange={(next) => { reported.push(next); setDates(next) }} />
}

async function open(props: DateRangeFilterProps = {}) {
  reported = []
  const user = userEvent.setup()
  render(<Controlled {...props} />)
  await user.click(screen.getByRole('button', { name: /All dates|Any time/ }))
  return user
}

test('a preset reports its range and names the trigger', async () => {
  const user = await open()
  await user.click(screen.getByRole('button', { name: 'Last month' }))
  expect(reported).toEqual([['2026-10-01', '2026-10-31']])
  expect(screen.getByRole('button', { name: 'Last month', pressed: true })).toBeTruthy()
  expect(screen.getByRole('button', { name: /^Last month$/, expanded: true })).toBeTruthy()
})

test('weeks start on the locale’s first day', async () => {
  const user = await open({ presets: ['thisWeek'], locale: 'en-US' })
  await user.click(screen.getByRole('button', { name: 'This week' }))
  // 12 November 2026 is a Thursday; American weeks start on Sunday the 8th.
  expect(reported).toEqual([['2026-11-08', '2026-11-14']])
})

test('a range of your own, and Clear', async () => {
  const user = await open({ placeholder: 'Any time', presets: [{ label: 'Spring', range: () => ['2026-03-01', '2026-05-31'] }] })
  await user.click(screen.getByRole('button', { name: 'Spring' }))
  await user.click(screen.getByRole('button', { name: 'Clear' }))
  expect(reported).toEqual([['2026-03-01', '2026-05-31'], []])
  expect(screen.getByRole('button', { name: 'Any time' })).toBeTruthy()
})

test('dates matching no preset show as a range', () => {
  render(<DateRangeFilter value={['2026-10-23', '2026-11-10']} />)
  expect(screen.getByRole('button', { name: /23 Oct.+10 Nov 2026/ })).toBeTruthy()
})
