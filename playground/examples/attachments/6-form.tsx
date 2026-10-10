/* In a form, new or edit
  One form for both: a new record starts with no files, an edit with the saved ones (plain objects with an `id`). In a Field it takes the label, hint and error. With `name` and `keptName` it posts with the form like any input: the new Files, and the ids of the saved files still there (so the server can delete the rest). Submit to see what would be sent. */
import { useState, type FormEvent } from 'react'
import { Attachments, Field, Fields, Input, Segmented, Button, type Attachment } from '@milktop/react-ui'
import { photo } from './files'

const saved: Attachment[] = [
  { id: 101, name: 'Worksheet 4.pdf', size: 482000, type: 'application/pdf' },
  { id: 102, name: 'Homework photo.jpg', size: 910000, type: 'image/jpeg', ...photo('form-homework') },
]

function LessonForm({ record }: { record: { title: string, files: Attachment[] } | null }) {
  const [files, setFiles] = useState<Attachment[]>(record?.files ?? [])
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!files.length) return setError('Attach at least one file')
    setError(null)
    // What a plain form post would send, read back from the form itself.
    const data = new FormData(e.currentTarget)
    const removed = (record?.files ?? []).filter((file) => !files.includes(file))
    setSent(JSON.stringify({
      title: data.get('title'),
      newFiles: data.getAll('files').map((file) => (file as File).name),
      keep: data.getAll('keep'),
      removed: removed.map((file) => (file as { id?: number }).id),
    }, null, 1))
  }

  return (
    <form onSubmit={submit} noValidate className="flex w-full flex-col gap-4">
      <Fields>
        <Field label="Title" span={12}><Input name="title" defaultValue={record?.title ?? ''} placeholder="e.g. Fractions homework" /></Field>
        <Field label="Files" hint="Images or PDFs, up to 5." error={error} required span={12}>
          <Attachments items={files} onItemsChange={(next) => { setFiles(next); setError(null) }} addable removable layout="list"
            accept="image/*,.pdf" maxFiles={5} name="files" keptName="keep" />
        </Field>
      </Fields>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary">{record ? 'Save changes' : 'Create'}</Button>
        {sent && <pre className="m-0 flex-1 overflow-x-auto text-xs text-(--ui-muted)">{sent}</pre>}
      </div>
    </form>
  )
}

export default function Example() {
  const [mode, setMode] = useState('new')
  return (
    <div className="flex w-full flex-col gap-4">
      <Segmented items={[{ value: 'new', label: 'New record' }, { value: 'edit', label: 'Edit record' }]} value={mode} onValueChange={(v) => v && setMode(v)} />
      {/* A new form for each mode, as an app would mount one per record. */}
      <LessonForm key={mode} record={mode === 'edit' ? { title: 'Fractions homework', files: saved } : null} />
    </div>
  )
}
