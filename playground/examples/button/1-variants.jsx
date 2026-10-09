/* Variants and sizes
  `variant` sets the look, `size` matches the inputs' heights. */
import { Button } from '@milktop/react-ui'

export default function Example() {
  return <>
    <Button>Default</Button>
    <Button variant="primary">Primary</Button>
    <Button variant="soft">Soft</Button>
    <Button variant="danger">Delete</Button>
    <Button variant="ghost">Ghost</Button>
    <Button size="sm">Small</Button>
    <Button size="lg">Large</Button>
  </>
}
