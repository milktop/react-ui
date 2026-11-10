import { useState } from 'react'
import { afterEach, expect, test } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NumberInput, type NumberInputProps } from '../src/number-input/NumberInput.js'

afterEach(cleanup)

// Zag writes the input's value in an animation frame.
const frame = () => act(() => new Promise((resolve) => requestAnimationFrame(resolve)))

let reported: (number | null)[] = []
let setOutside: (value: number | null) => void

function Controlled(props: NumberInputProps) {
  const [value, setValue] = useState<number | null>(null)
  setOutside = setValue
  return <NumberInput label="Poids" value={value} {...props}
    onValueChange={(next) => { reported.push(next); setValue(next) }} />
}

async function type(props: NumberInputProps, keys: string) {
  reported = []
  const user = userEvent.setup()
  render(<Controlled {...props} />)
  const input = screen.getByRole('spinbutton')
  await user.click(input)
  // A key a frame, as zag puts the cursor back in the frame after each.
  for (const key of keys) { await user.keyboard(key); await frame() }
  return { user, input: input as HTMLInputElement }
}

for (const [name, props] of [
  ['fr-FR', { locale: 'fr-FR' }],
  ['fr-FR with formatOptions', { locale: 'fr-FR', formatOptions: { maximumFractionDigits: 3 } }],
] as [string, NumberInputProps][]) {
  test(`${name}: controlled, typing 4,257 keeps it`, async () => {
    const { input } = await type(props, '4,257')
    expect(input.value).toBe('4,257')
    expect(reported.at(-1)).toBe(4.257)
  })

  test(`${name}: a point is read as the decimal comma`, async () => {
    const { user, input } = await type(props, '4.25')
    expect(reported.at(-1)).toBe(4.25)
    await user.tab()
    await frame()
    expect(input.value).toBe('4,25')
    expect(reported.at(-1)).toBe(4.25)
  })

  test(`${name}: a second separator is refused`, async () => {
    const { input } = await type(props, '4,2.5')
    expect(input.value).toBe('4,25')
    expect(reported.at(-1)).toBe(4.25)
  })

  test(`${name}: back to a typed number from outside`, async () => {
    const { input } = await type(props, '4,25')
    act(() => setOutside(5))
    await frame()
    expect(input.value).toBe('5')
    act(() => setOutside(4.25))
    await frame()
    expect(input.value).toBe('4,25')
  })

  test(`${name}: an outside change shows in the locale`, async () => {
    const { input } = await type(props, '')
    act(() => setOutside(12.5))
    await frame()
    expect(input.value).toBe('12,5')
  })
}

test('de-DE: a point stays the group separator', async () => {
  const { input } = await type({ locale: 'de-DE', formatOptions: {} }, '1.234')
  expect(input.value).toBe('1.234')
  expect(reported.at(-1)).toBe(1234)
})

test('en-US: typing and outside changes as before', async () => {
  const { user, input } = await type({}, '4.257')
  expect(input.value).toBe('4.257')
  expect(reported.at(-1)).toBe(4.257)
  await user.tab()
  await frame()
  expect(input.value).toBe('4.257')
  act(() => setOutside(12.5))
  await frame()
  expect(input.value).toBe('12.5')
})
