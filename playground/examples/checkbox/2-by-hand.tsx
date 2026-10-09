/* By hand
  The same parts, laid out yourself: here the label comes first, or reads its state from `Checkbox.Context`. They pick up the same styles. */
import { Checkbox } from '@milktop/react-ui'

export default function Example() {
  return <>
    <Checkbox.Root defaultChecked className="flex-row-reverse justify-end">
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Send me the newsletter</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
    <Checkbox.Root>
      <Checkbox.Context>{(api) => (
        <>
          <Checkbox.Control><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Control>
          <Checkbox.Label>{api.checked ? 'Subscribed' : 'Not subscribed'}</Checkbox.Label>
        </>
      )}</Checkbox.Context>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
  </>
}
