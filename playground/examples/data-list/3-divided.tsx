/* Divided, with markup values */
import { DataList, Avatar, Badge } from '@milktop/react-ui'

export default function Example() {
  return (
    <DataList variant="divided">
      <DataList.Item label="Student"><span className="flex items-center gap-2"><Avatar size="sm" name="Ada Lovelace" />Ada Lovelace</span></DataList.Item>
      <DataList.Item label="Status"><Badge variant="success">Active</Badge></DataList.Item>
      <DataList.Item label="Next lesson">Thursday 8 October, 16:00</DataList.Item>
      <DataList.Item label="Notes" info="Only tutors see these">Prefers worked examples; revise fractions before the mock exam.</DataList.Item>
    </DataList>
  )
}
