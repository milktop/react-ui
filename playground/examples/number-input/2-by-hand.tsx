/* By hand
  Ark's parts in your own order: the steppers either side of the input. They pick up the same styles. */
import { NumberInput } from '@milktop/react-ui'

export default function Example() {
  return (
    <NumberInput.Root defaultValue="3" min={0} max={12}>
      <NumberInput.Label>Guests</NumberInput.Label>
      <NumberInput.Control>
        <NumberInput.DecrementTrigger><iconify-icon icon="lucide:minus" /></NumberInput.DecrementTrigger>
        <NumberInput.Input className="text-center" />
        <NumberInput.IncrementTrigger><iconify-icon icon="lucide:plus" /></NumberInput.IncrementTrigger>
      </NumberInput.Control>
    </NumberInput.Root>
  )
}
