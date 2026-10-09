/* Small, beside text */
import { Badge } from '@milktop/react-ui'

export default function Example() {
  return <>
    <span className="flex items-center gap-2">Messages <Badge size="sm" variant="accent">3</Badge></span>
    <span className="flex items-center gap-2">Maths with Ada <Badge size="sm">GCSE</Badge></span>
  </>
}
