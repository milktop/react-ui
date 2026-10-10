/* List */
import { Attachments } from '@milktop/react-ui'
import { files } from './files'

export default function Example() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Attachments layout="list" defaultItems={files.slice(3)} removable addable addLabel="Attach a file" />
      <Attachments layout="list" addable addLabel="Attach a file" />
    </div>
  )
}
