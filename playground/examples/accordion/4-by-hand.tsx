/* By hand
  Ark's parts, styled by the same CSS: Accordion.RawItem is Ark's item (Accordion.Item is ours). */
import { Accordion } from '@milktop/react-ui'

export default function Example() {
  return (
    <Accordion.Root collapsible defaultValue={['a']}>
      {['a', 'b'].map((value) => (
        <Accordion.RawItem key={value} value={value}>
          <Accordion.ItemTrigger>Section {value.toUpperCase()} <Accordion.ItemIndicator>▾</Accordion.ItemIndicator></Accordion.ItemTrigger>
          <Accordion.ItemContent><p className="mt-0 text-sm">The content of section {value.toUpperCase()}.</p></Accordion.ItemContent>
        </Accordion.RawItem>
      ))}
    </Accordion.Root>
  )
}
