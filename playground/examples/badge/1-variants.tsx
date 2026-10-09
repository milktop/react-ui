/* Variants */
import { Badge } from '@milktop/react-ui'

export default function Example() {
  return <>
    <Badge>Draft</Badge>
    <Badge variant="accent">New</Badge>
    <Badge variant="success">Paid</Badge>
    <Badge variant="warning">Due soon</Badge>
    <Badge variant="danger">Overdue</Badge>
    <Badge variant="outline">Archived</Badge>
  </>
}
