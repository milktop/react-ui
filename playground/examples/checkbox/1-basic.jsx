/* Checkboxes
  `checked` and `onCheckedChange`, with the label as text or children; 'indeterminate' shows a dash. */
import { useState } from 'react'
import { Checkbox } from '@milktop/react-ui'

export default function Example() {
  const [agreed, setAgreed] = useState(false)
  return <>
    <Checkbox checked={agreed} onCheckedChange={setAgreed}>I agree to the <a href="#/checkbox">terms</a></Checkbox>
    <Checkbox label="Indeterminate" defaultChecked="indeterminate" />
    <Checkbox label="Disabled" disabled />
    <Checkbox label="Custom indicator" defaultChecked indicator={({ indeterminate }) => (indeterminate ? '–' : '★')} />
    <p>agreed: {String(agreed)}</p>
  </>
}
