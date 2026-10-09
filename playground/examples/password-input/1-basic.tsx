/* Show and hide
  The eye button toggles it; `visible` and `onVisibilityChange` control it from outside. */
import { useState } from 'react'
import { PasswordInput } from '@milktop/react-ui'

export default function Example() {
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  return <>
    <PasswordInput label="Password" icon="lucide:lock" value={password} onValueChange={setPassword}
      placeholder="At least 8 characters" autoComplete="new-password" />
    <PasswordInput label="Shown from outside" visible={visible} onVisibilityChange={setVisible} defaultValue="hunter2" />
    <p>{password.length} characters, second one {visible ? 'shown' : 'hidden'}</p>
  </>
}
