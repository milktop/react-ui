/* Inputs
  `value` and `onValueChange` (a number for type="number"), with icons and affixes. */
import { useState } from 'react'
import { Input } from '@milktop/react-ui'

export default function Example() {
  const [name, setName] = useState('Ada')
  const [price, setPrice] = useState(12)
  return <>
    <Input label="Name" value={name} onValueChange={setName} />
    <Input label="Price" type="number" prefix="£" value={price} onValueChange={setPrice} />
    <Input label="Search" icon="lucide:search" placeholder="Search…" round />
    <Input label="Weight" suffix="kg" size="sm" defaultValue="70" />
    <p>name: {name}, price: {price} ({typeof price})</p>
  </>
}
