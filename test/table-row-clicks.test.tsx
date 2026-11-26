import { useState } from 'react'
import { afterEach, expect, test } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Table } from '../src/table/Table.js'

afterEach(cleanup)

type Animal = { id: number; name: string }
const animals: Animal[] = [{ id: 1, name: 'Berlioz' }, { id: 2, name: 'Naska' }, { id: 3, name: 'Malou' }, { id: 4, name: 'Pirate' }]

function Animals({ opened }: { opened: string[] }) {
  const [selected, setSelected] = useState<(string | number)[]>([])
  return (
    <>
      <Table rows={animals} columns={[{ key: 'name', label: 'Nom' }]} selectable selected={selected} onSelectedChange={setSelected}
        onRowClick={(row, event) => opened.push(`${row.name}${event.button === 1 ? ' (new tab)' : ''}`)} />
      <output>{selected.join(',')}</output>
    </>
  )
}

const cell = (name: string) => screen.getByText(name)
const ticked = () => document.querySelector('output')!.textContent

function click(name: string, options: MouseEventInit = {}) {
  fireEvent.pointerDown(cell(name), options)
  fireEvent.mouseDown(cell(name), options)
  fireEvent.click(cell(name), options)
}

test('a plain click opens a row; ⌘ or Ctrl ticks it instead', () => {
  const opened: string[] = []
  render(<Animals opened={opened} />)

  click('Berlioz')
  expect(opened).toEqual(['Berlioz'])

  click('Naska', { metaKey: true })
  click('Malou', { ctrlKey: true })
  expect(ticked()).toBe('2,3')

  // Once some are ticked, a plain click ticks too
  click('Berlioz')
  expect(ticked()).toBe('2,3,1')
  expect(opened).toEqual(['Berlioz'])
})

test('Shift-click ticks a run from the last row clicked, before any row is ticked too', () => {
  render(<Animals opened={[]} />)

  click('Naska', { shiftKey: true })
  click('Pirate', { shiftKey: true })
  expect(ticked()).toBe('2,3,4')
})

test('a middle click opens the row, for a new tab', () => {
  const opened: string[] = []
  render(<Animals opened={opened} />)

  fireEvent(cell('Malou'), new MouseEvent('auxclick', { bubbles: true, button: 1 }))
  expect(opened).toEqual(['Malou (new tab)'])
})

test('while ⌘, Ctrl or Shift is held, the table says a click would tick (for the hovered row’s faint tick)', () => {
  render(<Animals opened={[]} />)
  const table = () => document.querySelector('[data-scope=table][data-part=root]')!

  fireEvent.keyDown(window, { key: 'Meta', metaKey: true })
  expect(table().hasAttribute('data-ticking')).toBe(true)
  fireEvent.keyUp(window, { key: 'Meta' })
  expect(table().hasAttribute('data-ticking')).toBe(false)

  fireEvent.pointerMove(cell('Naska'), { shiftKey: true })
  expect(table().hasAttribute('data-ticking')).toBe(true)
  fireEvent.blur(window)
  expect(table().hasAttribute('data-ticking')).toBe(false)
})
