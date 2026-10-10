/* Compact, with a sticky header
  `maxHeight` scrolls the rows under the header; `defaultSort` starts it sorted. */
import { Table } from '@milktop/react-ui'
import { students } from './students'
import { columns } from './columns'

export default function Example() {
  return <Table columns={columns} rows={students} size="sm" maxHeight="16rem" defaultSort={{ key: 'lessons', dir: 'desc' }} />
}
