/* In French
  `locale="fr-FR"` writes and reads a decimal comma; a point from the keypad types one too. The value is a plain number. */
import { useState } from 'react'
import { NumberInput } from '@milktop/react-ui'

export default function Example() {
  const [weight, setWeight] = useState<number | null>(4.25)
  const [price, setPrice] = useState<number | null>(1234.5)
  return <>
    <NumberInput label="Poids" value={weight} onValueChange={setWeight} min={0} step={0.1} suffix="kg" locale="fr-FR" />
    <NumberInput label="Prix" value={price} onValueChange={setPrice} min={0} steppers={false} locale="fr-FR"
      formatOptions={{ style: 'currency', currency: 'EUR' }} />
    <p>{weight} ({typeof weight}), {price} <button type="button" className="underline" onClick={() => setWeight(12.5)}>Set 12.5 kg</button></p>
  </>
}
