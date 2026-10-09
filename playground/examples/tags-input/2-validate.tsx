/* Validating
  `validate` decides what gets in (emails only here); a rejected entry stays to fix. `max` caps the count. */
import { useState } from 'react'
import { TagsInput } from '@milktop/react-ui'

const isEmail = ({ inputValue }: { inputValue: string }) => /^\S+@\S+\.\S+$/.test(inputValue)

export default function Example() {
  const [emails, setEmails] = useState<string[]>([])
  return <>
    <TagsInput label="Invite" value={emails} onValueChange={setEmails} validate={isEmail} max={3} variant="outline" placeholder="name@example.com" />
    <p>Emails only, up to 3 ({emails.length} so far)</p>
  </>
}
