/* Stacked and divided */
import { DataList } from '@milktop/react-ui'
import { details } from './details'

export default function Example() {
  return <DataList orientation="vertical" variant="divided" items={details.slice(0, 3)} />
}
