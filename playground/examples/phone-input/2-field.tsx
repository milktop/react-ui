/* In a Field
  `type="phone"`: the field shows the number's own problem (too short, too long) while it has no error of its own. */
import { useState } from 'react'
import { Field, Fields } from '@milktop/react-ui'

export default function Example() {
  const [phone, setPhone] = useState<string | null>(null)
  const [other, setOther] = useState<string | null>('+33612345678')
  return <>
    <Fields>
      <Field span={6} label="Phone" type="phone" country="FR" countries={['FR', 'BE', 'GB']} showType hint="Mobile or landline" value={phone} onValueChange={setPhone} />
      <Field span={6} label="Other phone" type="phone" country="FR" picker="native" showType value={other} onValueChange={setOther} />
    </Fields>
    <p>{JSON.stringify({ phone, other })}</p>
  </>
}
