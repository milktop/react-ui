/* Photos, three per row
  `columns` sets the most per row (fewer when tiles would get too small). Images can have a small `thumb` for the tile and a full-size `url` for the preview; click one to see it large. */
import { useState } from 'react'
import { Attachments, type Attachment } from '@milktop/react-ui'
import { photo } from './files'

export default function Example() {
  const [covers, setCovers] = useState<Attachment[]>([
    { name: 'Cover 1.jpg', size: 920000, type: 'image/jpeg', ...photo('cover-one') },
    { name: 'Cover 2.jpg', size: 870000, type: 'image/jpeg', ...photo('cover-two') },
    { name: 'Cover 3.jpg', size: 1010000, type: 'image/jpeg', ...photo('cover-three') },
  ])
  return <>
    <Attachments columns={3} items={covers} onItemsChange={setCovers} removable addable accept="image/*" addLabel="Add photos" />
    <p className="m-0 w-full text-sm text-(--ui-muted)">{JSON.stringify(covers.map((c) => c.name))}</p>
  </>
}
