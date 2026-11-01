/* Basic
  Numbers typed without "+" are read as the country's; the value is E.164 once valid, the text as typed until then. Leave it invalid to see why. */
import { useState } from 'react'
import { PhoneInput } from '@milktop/react-ui'

export default function Example() {
  const [phone, setPhone] = useState<string | null>('+447400123456')
  return <>
    <PhoneInput label="Phone" country="GB" countries={['GB', 'IE', 'FR']} showType value={phone} onValueChange={setPhone} />
    <p>phone: {JSON.stringify(phone)}</p>
  </>
}
