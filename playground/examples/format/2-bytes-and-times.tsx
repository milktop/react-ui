/* Sizes and times
  `FormatBytes` ('2.4 MB'; `binary` for MiB), and `FormatRelative` ('2 hours ago'), which keeps itself up to date and shows the full date on hover. */
import { FormatBytes, FormatRelative, DataList } from '@milktop/react-ui'

const ago = (minutes: number) => new Date(Date.now() - minutes * 60000)

export default function Example() {
  return (
    <DataList className="w-full max-w-md" labelWidth="9rem" items={[
      { label: 'A photo', value: <FormatBytes value={910000} /> },
      { label: 'Slides', value: <FormatBytes value={2516582} /> },
      { label: 'Binary', value: <FormatBytes value={2516582} binary /> },
      { label: 'Just now', value: <FormatRelative value={ago(0.2)} /> },
      { label: 'Earlier', value: <FormatRelative value={ago(125)} /> },
      { label: 'Yesterday', value: <FormatRelative value={ago(60 * 26)} /> },
      { label: 'Next week', value: <FormatRelative value={new Date(Date.now() + 8 * 86400000)} /> },
    ]} />
  )
}
