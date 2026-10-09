/* By hand
  Ark's SegmentGroup parts, with Group as the track: here each option shows a count. They pick up the same styles and the sliding indicator. */
import { Segmented } from '@milktop/react-ui'

const tabs = [['open', 'Open', 4], ['done', 'Done', 12], ['all', 'All', 16]] as const

export default function Example() {
  return (
    <Segmented.Root defaultValue="open" orientation="horizontal">
      <Segmented.Group>
        <Segmented.Indicator />
        {tabs.map(([value, text, count]) => (
          <Segmented.Item key={value} value={value}>
            <Segmented.ItemText>{text} <span className="ml-1 text-xs text-(--ui-muted)">{count}</span></Segmented.ItemText>
            <Segmented.ItemHiddenInput />
          </Segmented.Item>
        ))}
      </Segmented.Group>
    </Segmented.Root>
  )
}
