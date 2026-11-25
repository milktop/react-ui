/* In a Field
  Several in one Field each tick on their own: one with its own label keeps its own ids. One without a label is the Field's control, named and ticked by the Field's label. */
import { useState } from 'react'
import { Checkbox, Field, Fields, Switch } from '@milktop/react-ui'

const animals = ['Berlioz', 'Naska', 'Malou']

export default function Example() {
  const [picked, setPicked] = useState(['Naska'])
  const [onDuty, setOnDuty] = useState(false)
  const toggle = (name: string, on: boolean) => setPicked(on ? [...picked, name] : picked.filter((each) => each !== name))
  return <>
    <Fields>
      <Field label="Animaux">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {animals.map((name) => <Checkbox key={name} label={name} checked={picked.includes(name)} onCheckedChange={(on) => toggle(name, on)} />)}
        </div>
      </Field>
      <Field label="De garde">
        <Switch checked={onDuty} onCheckedChange={setOnDuty} />
      </Field>
    </Fields>
    <p>{JSON.stringify(picked)}, de garde: {String(onDuty)}</p>
  </>
}
