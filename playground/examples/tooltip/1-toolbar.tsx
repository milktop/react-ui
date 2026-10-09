/* Toolbar
  Wrap your button: it gets the trigger's props and keeps its own label and clicks. */
import { Tooltip, Button } from '@milktop/react-ui'

const tools = [['Bold', 'lucide:bold'], ['Italic', 'lucide:italic'], ['Underline', 'lucide:underline'],
  ['Insert link', 'lucide:link'], ['Clear formatting', 'lucide:remove-formatting']]

export default function Example() {
  return (
    <div className="inline-flex gap-0.5 rounded-(--ui-radius) border border-(--ui-border) p-1">
      {tools.map(([label, icon]) => (
        <Tooltip key={label} content={label}><Button variant="ghost" icon={icon} aria-label={label} /></Tooltip>
      ))}
    </div>
  )
}
