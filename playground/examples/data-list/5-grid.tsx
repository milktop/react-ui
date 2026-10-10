/* Stacked, in a grid */
import { DataList } from '@milktop/react-ui'

export default function Example() {
  return (
    <DataList orientation="vertical" columns={3} items={[
      { label: 'Lessons', value: '24' },
      { label: 'Attendance', value: '92%' },
      { label: 'Since', value: 'September 2025' },
      { label: 'Tutor', value: 'Grace Hopper' },
      { label: 'Rate', value: '£35 / hour' },
      { label: 'Payment', value: 'Monthly, by card' },
    ]} />
  )
}
