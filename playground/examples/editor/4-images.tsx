/* With images
  Give it `uploadImage` (an async function: File in, URL out, or `{ src, data-… }` to keep ids on the image) and images can be dropped, pasted or picked with the image button. Without it, dropped files are ignored instead of opening in the tab. */
import { useState } from 'react'
import { Editor } from '@milktop/react-ui'

// Stands in for a real upload: waits a moment, then returns a local URL
// and an id your server could resolve later.
async function fakeUpload(file: File) {
  await new Promise((done) => setTimeout(done, 600))
  return { src: URL.createObjectURL(file), 'data-upload-id': `upload-${Date.now()}` }
}

export default function Example() {
  const [homework, setHomework] = useState('<p>Label the parts of this diagram:</p><img src="https://picsum.photos/seed/editor-diagram/800/400" alt="Diagram">')
  return <>
    <Editor value={homework} onValueChange={setHomework} uploadImage={fakeUpload} />
    <p className="m-0 w-full text-xs break-all text-(--ui-muted)">{homework}</p>
  </>
}
