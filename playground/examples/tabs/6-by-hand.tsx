/* By hand
  Ark's parts, with `data-variant` on the root for the look and `Tabs.Count` for a count: here a close button sits after the tabs. They pick up the same styles and the sliding indicator. */
import { Tabs, Button } from '@milktop/react-ui'

export default function Example() {
  return (
    <Tabs.Root defaultValue="draft" data-variant="line">
      <Tabs.List>
        <Tabs.Trigger value="draft">Draft <Tabs.Count data-color="accent">3</Tabs.Count></Tabs.Trigger>
        <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
        <Tabs.Indicator />
        <Button size="sm" variant="ghost" icon="lucide:x" aria-label="Close" className="ml-auto self-center" />
      </Tabs.List>
      <Tabs.Content value="draft">Writing the lesson plan…</Tabs.Content>
      <Tabs.Content value="preview">How students will see it.</Tabs.Content>
    </Tabs.Root>
  )
}
