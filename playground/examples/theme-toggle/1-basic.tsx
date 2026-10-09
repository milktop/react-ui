/* Basic
  It drives `colorScheme`, so every toggle on the page (and the playground's own) stays in step, and the choice is saved. */
import { useState } from 'react'
import { ThemeToggle, useColorScheme, type Scheme } from '@milktop/react-ui'

export default function Example() {
  const [picked, setPicked] = useState<Scheme | null>(null)
  const { scheme, dark } = useColorScheme()
  return <>
    <ThemeToggle onChange={setPicked} />
    <p className="m-0 w-full text-sm text-(--ui-muted)">{JSON.stringify({ picked, scheme, dark })}</p>
  </>
}
