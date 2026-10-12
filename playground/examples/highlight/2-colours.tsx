/* Colours
  `color`: a named tint ('yellow', 'green'…), deeper in dark mode, or any CSS colour as it is. The default is the accent's tint, the `--ui-highlight` token. */
import { Highlight } from '@milktop/react-ui'

const text = 'Rex had his booster vaccine and a dental check today.'
const colours = ['accent', 'yellow', 'amber', 'orange', 'red', 'green', 'teal', 'blue', 'purple', 'pink', 'gray', '#a5f3fc']

export default function Example() {
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      {colours.map((color) => (
        <span key={color}><code className="inline-block w-20 text-xs text-(--ui-muted)">{color}</code> <Highlight text={text} query={['vaccine', 'dental']} color={color} /></span>
      ))}
    </div>
  )
}
