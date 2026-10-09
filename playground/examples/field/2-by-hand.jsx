/* By hand
  Ark's Field parts, for a layout the shortcut doesn't give: the hint beside the label. */
import { useState } from 'react'
import { Field, Input } from '@milktop/react-ui'

export default function Example() {
  const [email, setEmail] = useState('ada@')
  const invalid = !/^\S+@\S+\.\S+$/.test(email)
  return (
    <Field.Root invalid={invalid} required className="w-full max-w-sm">
      <div className="flex items-baseline justify-between">
        <Field.Label>Email <Field.RequiredIndicator /></Field.Label>
        <Field.HelperText>We never share it</Field.HelperText>
      </div>
      <Input type="email" value={email} onValueChange={setEmail} />
      <Field.ErrorText>Enter a whole email address</Field.ErrorText>
    </Field.Root>
  )
}
