/* In an input
  The copy button sits in the input's `end`. */
import { Input, CopyButton } from '@milktop/react-ui'

const link = 'https://example.com/book/ada-lovelace'

export default function Example() {
  return <Input label="Share link" value={link} readOnly className="w-full max-w-md" end={<CopyButton value={link} />} />
}
