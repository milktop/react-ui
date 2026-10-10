/* In a field
  It takes the field's label, hint and error. */
import { useState } from 'react'
import { Editor, Fields, Field } from '@milktop/react-ui'

export default function Example() {
  const [message, setMessage] = useState('')
  // The value is HTML: count its text.
  const length = message.replace(/<[^>]*>/g, '').length
  return (
    <Fields className="w-full">
      <Field label="Message to parents" hint="They’ll get this by email."
        error={length > 0 && length < 20 ? 'A little more, please' : null}>
        <Editor value={message} onValueChange={setMessage} placeholder="Write a message…" minHeight="6rem" />
      </Field>
    </Fields>
  )
}
