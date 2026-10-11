/* Lines, labels and toolbars
  Across with an optional `label` (`align`), `variant` dashed or dotted, or `orientation="vertical"` between toolbar buttons. */
import { Divider, Button } from '@milktop/react-ui'

export default function Example() {
  return (
    <div className="flex w-full flex-col">
      <p className="m-0 text-sm">Above</p>
      <Divider />
      <p className="m-0 text-sm">Below</p>
      <Divider label="or" />
      <Divider label="Today" align="start" variant="dashed" />
      <Divider label="Earlier" align="end" variant="dotted" />
      <div className="mt-2 flex items-center">
        <Button size="sm" variant="ghost" icon="lucide:bold" aria-label="Bold" />
        <Button size="sm" variant="ghost" icon="lucide:italic" aria-label="Italic" />
        <Divider orientation="vertical" />
        <Button size="sm" variant="ghost" icon="lucide:link" aria-label="Link" />
      </div>
    </div>
  )
}
