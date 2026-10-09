/* With text
  For buttons, use Button's `loading` instead. */
import { Spinner } from '@milktop/react-ui'

export default function Example() {
  return <span className="flex items-center gap-2 text-sm text-(--ui-muted)"><Spinner size="sm" label="Saving" />Saving changes…</span>
}
