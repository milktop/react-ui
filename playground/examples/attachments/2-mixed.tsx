/* Mixed files
  Without `columns`, as many fit as there's room for. Hover a tile for download and remove; the last tile adds files from your computer, or drop them anywhere on the attachments (previewed locally). */
import { useState } from 'react'
import { Attachments } from '@milktop/react-ui'
import { files as initial } from './files'

export default function Example() {
  const [files, setFiles] = useState(initial)
  const [removed, setRemoved] = useState<string | null>(null)
  return <>
    <Attachments items={files} onItemsChange={setFiles} removable addable onRemove={(item) => setRemoved(item.name ?? null)} />
    <p className="m-0 w-full text-sm text-(--ui-muted)">{JSON.stringify({ count: files.length, removed })}</p>
  </>
}
