/* Codes and PINs
  Typing moves along the boxes, pasting fills them all, and `onComplete` fires once they're full. `mask` hides the characters. */
import { useState } from 'react'
import { PinInput } from '@milktop/react-ui'

export default function Example() {
  const [code, setCode] = useState('')
  const [pin, setPin] = useState('')
  const [done, setDone] = useState<string | null>(null)
  return <>
    <PinInput label="Code" count={6} otp value={code} onValueChange={setCode} onComplete={setDone} />
    <PinInput label="PIN" mask value={pin} onValueChange={setPin} count={4} />
    <p>Code: {code || '—'}{done ? ` (completed: ${done})` : ''}, PIN: {pin.length} of 4</p>
  </>
}
