/* A value or a range
  An array value gives two thumbs; `formatOptions` formats the value and marks; `marks` can carry their own labels. */
import { useState } from 'react'
import { Slider } from '@milktop/react-ui'

export default function Example() {
  const [volume, setVolume] = useState(40)
  const [price, setPrice] = useState([20, 60])
  const [level, setLevel] = useState(2)
  return <>
    <Slider label="Volume" value={volume} onValueChange={setVolume} />
    <Slider label="Price" value={price} onValueChange={setPrice} step={5} locale="en-GB" marks={[0, 50, 100]}
      formatOptions={{ style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }} />
    <Slider label="Confidence" value={level} onValueChange={setLevel} min={1} max={3} showValue={false}
      marks={[{ value: 1, label: 'Unsure' }, { value: 2, label: 'Getting there' }, { value: 3, label: 'Confident' }]} />
    <p>{volume}, {JSON.stringify(price)}, {level}</p>
  </>
}
