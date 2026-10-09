/* By hand
  Ark's parts with `createListCollection`, here with grouped items. They pick up the same styles. */
import { Select, createListCollection } from '@milktop/react-ui'

const collection = createListCollection({
  items: [
    { label: 'Apple', value: 'apple', group: 'Fruit' },
    { label: 'Banana', value: 'banana', group: 'Fruit' },
    { label: 'Carrot', value: 'carrot', group: 'Vegetables' },
    { label: 'Leek', value: 'leek', group: 'Vegetables' },
  ],
  groupBy: (item) => item.group,
})

export default function Example() {
  return (
    <Select.Root collection={collection} positioning={{ sameWidth: true }}>
      <Select.Label>Food</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Pick one" />
          <Select.Indicator><iconify-icon icon="lucide:chevrons-up-down" /></Select.Indicator>
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner>
        <Select.Content>
          {collection.group().map(([group, items]) => (
            <Select.ItemGroup key={group}>
              <Select.ItemGroupLabel className="px-2 pt-2 pb-1 text-xs font-semibold text-(--ui-muted)">{group}</Select.ItemGroupLabel>
              {items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator>✓</Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.ItemGroup>
          ))}
        </Select.Content>
      </Select.Positioner>
      <Select.HiddenSelect />
    </Select.Root>
  )
}
