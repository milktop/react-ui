/* Your own viewer
  `onOpen` gets the file when it's clicked. Return true to say you've shown it yourself; here the PDF, while the image keeps its default preview.
*/
import { useState } from 'react'
import { Attachments, type Attachment } from '@milktop/react-ui'
import { photo } from './files'

const files: Attachment[] = [
  { name: 'Report.pdf', size: 240000, type: 'application/pdf', url: '#' },
  { name: 'Cover.jpg', size: 920000, type: 'image/jpeg', ...photo('cover-one') },
]

export default function Example() {
  const [opened, setOpened] = useState('Nothing yet')

  const open = (file: Attachment) => {
    if (file.type !== 'application/pdf') return
    setOpened(`Showing ${file.name}`)
    return true
  }

  return <>
    <Attachments items={files} onOpen={open} />
    <p className="m-0 w-full text-sm text-(--ui-muted)">{opened}</p>
  </>
}
