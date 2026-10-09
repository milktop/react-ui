/* Basic
  `onCopy` is called once the value is copied. */
import { useState } from 'react'
import { CopyButton } from '@milktop/react-ui'

const code = 'TUT-4821-XQ'

export default function Example() {
  const [copies, setCopies] = useState(0)
  return <>
    <span className="flex items-center gap-2"><code>{code}</code><CopyButton value={code} onCopy={() => setCopies((n) => n + 1)} /></span>
    <p className="m-0 w-full text-sm text-(--ui-muted)">copies: {copies}</p>
  </>
}
