/* As markup
  DataList.Item takes the same fields, with the value inside, so it can be any markup. */
import { DataList } from '@milktop/react-ui'

export default function Example() {
  return (
    <DataList>
      <DataList.Item label="Name">Ada Lovelace</DataList.Item>
      <DataList.Item label="Email"><a href="mailto:ada@example.com" className="text-(--ui-accent) underline underline-offset-2">ada@example.com</a></DataList.Item>
      <DataList.Item label="Year" info="School year from September">11</DataList.Item>
    </DataList>
  )
}
