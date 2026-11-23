import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatePicker } from '../src/date-picker/DatePicker.js'

afterEach(cleanup)

test("pick='month' picks a month from the year's grid", async () => {
  const onValueChange = vi.fn()
  render(<DatePicker inline pick="month" value="2026-11-15" onValueChange={onValueChange} />)

  expect(screen.queryByRole('columnheader')).toBeNull()
  await userEvent.click(screen.getByText(/^mar/i))

  expect(onValueChange.mock.calls[0]?.[0]).toMatch(/^2026-03-/)
})
