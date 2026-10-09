/* By hand
  Ark's parts straight in the root, with a badge beside one option. They pick up the same styles. */
import { RadioGroup } from '@milktop/react-ui'

export default function Example() {
  return (
    <RadioGroup.Root defaultValue="video">
      <RadioGroup.Label>Where</RadioGroup.Label>
      {[['home', 'At home'], ['video', 'On video'], ['school', 'At school']].map(([value, text]) => (
        <RadioGroup.Item key={value} value={value}>
          <RadioGroup.ItemControl />
          <RadioGroup.ItemText>{text}</RadioGroup.ItemText>
          {value === 'video' && <span className="rounded bg-(--ui-accent-soft) px-1.5 text-xs text-(--ui-accent-soft-text)">New</span>}
          <RadioGroup.ItemHiddenInput />
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  )
}
