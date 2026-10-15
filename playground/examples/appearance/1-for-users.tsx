/* For users
  `accents` and `sidebars` list what users may choose, the default first: a saved choice outside them moves to it. The accent becomes the `--ui-accent-50` … `-950` scale on <html>, so every accent token follows it; the sidebar styles recolour this page's own sidebar (in light mode). */
import { useState } from 'react'
import { Appearance, useAppearance, type AppearanceValue } from '@milktop/react-ui'

export default function Example() {
  const [picked, setPicked] = useState<AppearanceValue | null>(null)
  const appearance = useAppearance()
  return <>
    <Appearance accents={['teal', 'blue', 'violet', 'rose']} sidebars={['neutral', 'tint', 'dark']} onChange={setPicked} />
    <p className="m-0 w-full text-sm text-(--ui-muted)">{JSON.stringify({ picked, appearance })}</p>
  </>
}
