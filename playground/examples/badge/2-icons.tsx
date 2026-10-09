/* Icons and dots */
import { Badge } from '@milktop/react-ui'

export default function Example() {
  return <>
    <Badge variant="success" icon="lucide:check">Confirmed</Badge>
    <Badge variant="accent" icon="lucide:video">Online</Badge>
    <Badge variant="success" dot>Active</Badge>
    <Badge variant="danger" dot>Offline</Badge>
  </>
}
