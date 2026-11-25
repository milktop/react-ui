import { useState } from 'react'
import { afterEach, expect, test } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '../src/checkbox/Checkbox.js'
import { CheckboxGroup } from '../src/checkbox/CheckboxGroup.js'
import { Field } from '../src/field/Field.js'
import { Switch } from '../src/switch/Switch.js'

afterEach(cleanup)

const names = ['Berlioz', 'Naska', 'Malou']

function Animals() {
  const [picked, setPicked] = useState<string[]>([])
  return (
    <Field label="Animaux">
      {names.map((name) => (
        <Checkbox key={name} label={name} checked={picked.includes(name)}
          onCheckedChange={(on) => setPicked(on ? [...picked, name] : picked.filter((each) => each !== name))} />
      ))}
    </Field>
  )
}

// The input inside the box named so, whatever ids it ended up with
const input = (name: string) => screen.getByText(name).closest('label')!.querySelector('input')!
const fieldInput = (label: string) => screen.getByText(label).closest('[data-scope=field][data-part=root]')!.querySelector('input')!

test('labelled checkboxes in one Field each keep their own id', () => {
  render(<Animals />)
  expect(new Set(names.map((name) => input(name).id)).size).toBe(3)
})

test('a click on a labelled checkbox in a Field ticks that one only', async () => {
  const user = userEvent.setup()
  render(<Animals />)
  await user.click(screen.getByText('Naska'))
  await user.click(screen.getByText('Malou'))
  expect(names.map((name) => input(name).checked)).toEqual([false, true, true])
})

test('a CheckboxGroup in a Field ticks each item on its own', async () => {
  const user = userEvent.setup()
  render(<Field label="Animaux"><CheckboxGroup items={names} selectAll="Tous" /></Field>)
  await user.click(screen.getByText('Malou'))
  expect(names.map((name) => input(name).checked)).toEqual([false, false, true])
})

test("an unlabelled checkbox or switch is the Field's control, named and toggled by its label", async () => {
  const user = userEvent.setup()
  render(<>
    <Field label="Facturé"><Checkbox /></Field>
    <Field label="De garde"><Switch /></Field>
  </>)
  await user.click(screen.getByText('Facturé'))
  await user.click(screen.getByText('De garde'))
  expect(fieldInput('Facturé').checked).toBe(true)
  expect(fieldInput('De garde').checked).toBe(true)
  expect(screen.getByRole('checkbox', { name: 'Facturé' })).toBe(fieldInput('Facturé'))
})

test("labelled ones still take the Field's disabled and invalid", () => {
  render(<>
    <Field label="Animaux" disabled><Checkbox label="Berlioz" /><Switch label="Naska" /></Field>
    <Field label="Autres" error="Requis"><Checkbox label="Malou" /></Field>
  </>)
  expect(input('Berlioz').disabled).toBe(true)
  expect(input('Naska').disabled).toBe(true)
  expect(input('Malou').getAttribute('aria-invalid')).toBe('true')
})

test('labelled switches in one Field each keep their own id', async () => {
  const user = userEvent.setup()
  render(<Field label="Rappels"><Switch label="Email" /><Switch label="SMS" /></Field>)
  expect(input('Email').id).not.toBe(input('SMS').id)
  await user.click(screen.getByText('SMS'))
  expect([input('Email').checked, input('SMS').checked]).toEqual([false, true])
})
