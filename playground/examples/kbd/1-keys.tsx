/* Keys and shortcuts
  One key as the content, or `keys` for a shortcut. */
import { Kbd, formatHotkey } from '@milktop/react-ui'

export default function Example() {
  return <>
    <Kbd>Esc</Kbd>
    <Kbd keys={['⌘', 'K']} />
    <Kbd keys={['Shift', 'F10']} size="sm" />
    <span className="text-sm text-(--ui-muted)">Search with <Kbd size="sm">{formatHotkey()}</Kbd></span>
  </>
}
