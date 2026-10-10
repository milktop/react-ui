/* Roomy
  `size` is 'sm', 'md' (default) or 'lg'. */
import { Table } from '@milktop/react-ui'
import { students } from './students'
import { columns } from './columns'

export default function Example() {
  return <Table columns={columns} rows={students.slice(0, 3)} size="lg" />
}
