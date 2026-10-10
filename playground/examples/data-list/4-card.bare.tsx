/* Card */
import { DataList } from '@milktop/react-ui'
import { details } from './details'

export default function Example() {
  return <DataList variant="card" items={details} labelWidth="8rem" />
}
