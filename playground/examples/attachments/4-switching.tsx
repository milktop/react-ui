/* Switching layout
  `switchable` adds a grid/list switch above the files; `persist` remembers the choice in this browser. To keep the choice yourself (say, in the user's settings), control `layout` with `onLayoutChange`. */
import { Attachments } from '@milktop/react-ui'
import { files } from './files'

export default function Example() {
  return <Attachments switchable persist="playground:attachments-layout" defaultItems={files.slice(0, 5)} removable className="w-full" />
}
