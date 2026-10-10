/* Limits and dropping
  Images or PDFs, up to 2 MB each, at most 3. Files that don’t fit are listed with the reason. */
import { useState } from 'react'
import { Attachments, type Attachment } from '@milktop/react-ui'

export default function Example() {
  const [photos, setPhotos] = useState<Attachment[]>([])
  const [rejects, setRejects] = useState<string[]>([])
  return <>
    <Attachments items={photos} onItemsChange={setPhotos} removable addable accept="image/*,.pdf" maxFiles={3} maxFileSize={2 * 1024 * 1024}
      addLabel="Add photos or PDFs" onReject={(list) => setRejects(list.map((r) => r.file.name))} />
    <p className="m-0 w-full text-sm text-(--ui-muted)">{JSON.stringify({ photos: photos.map((p) => p.name), rejects })}</p>
  </>
}
