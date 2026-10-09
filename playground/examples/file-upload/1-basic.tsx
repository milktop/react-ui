/* Upload files
  Drop or browse; images show a preview, and rejected files say why. */
import { useState } from 'react'
import { FileUpload } from '@milktop/react-ui'

export default function Example() {
  const [files, setFiles] = useState<File[]>([])
  return <>
    <FileUpload label="Worksheets" files={files} onFilesChange={setFiles} maxFiles={3} accept={['image/*', '.pdf']}
      hint="Images or PDFs, up to 3" className="w-full" />
    <p className="m-0 text-sm text-(--ui-muted)">{files.length} accepted: {files.map((f) => f.name).join(', ') || '—'}</p>
  </>
}
