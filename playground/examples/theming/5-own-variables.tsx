/* A component's own variables
  Some components read variables of their own, for things no shared token covers: Button's `--ui-button-count-bg` and `--ui-button-count-text`, AvatarGroup's `--ui-avatar-ring`. Each page's Styling panel lists them. Set them like tokens: on the component or any element around it. */
import type { CSSProperties } from 'react'
import { Button, AvatarGroup } from '@milktop/react-ui'

export default function Example() {
  return <>
    <Button icon="lucide:inbox" count={12} style={{ '--ui-button-count-bg': '#0f172a', '--ui-button-count-text': '#fde047' } as CSSProperties}>Inbox</Button>
    <AvatarGroup items={['Ada Lovelace', 'Alan Turing', 'Grace Hopper']} style={{ '--ui-avatar-ring': 'var(--ui-accent-soft)' } as CSSProperties} />
  </>
}
