/* On a menu's or a popover's trigger
  A button that opens something and has a hint: the menu gives it its props, the hint wraps it, and the tooltip finds the button by the menu's id. */
import type { ComponentProps } from 'react'
import { Button, Menu, Popover, Tooltip } from '@milktop/react-ui'

function HintButton({ hint, ...props }: ComponentProps<typeof Button> & { hint: string }) {
  return <Tooltip content={hint}><Button {...props} /></Tooltip>
}

export default function Example() {
  return <>
    <Menu trigger={<HintButton icon="lucide:ellipsis" aria-label="More" hint="Duplicate, archive or delete" />}>
      <Menu.Item value="duplicate">Duplicate</Menu.Item>
      <Menu.Item value="archive">Archive</Menu.Item>
    </Menu>
    <Popover heading="Filters" trigger={<HintButton icon="lucide:filter" aria-label="Filters" hint="Filter the list" />}>
      Filters go here.
    </Popover>
  </>
}
