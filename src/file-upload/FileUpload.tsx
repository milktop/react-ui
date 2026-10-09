/**
 * A file upload: drop files on it or browse, then see and remove them.
 *
 *   <FileUpload label="Worksheets" files={files} onFilesChange={setFiles} accept=".pdf" maxFiles={5} hint="PDFs, up to 5" />
 *
 * - `files`, `defaultFiles`: the accepted Files; `onFilesChange`: called with them
 * - `accept`: types to allow ('image/*', '.pdf', or an array of them)
 * - `maxFiles`: how many (1); `maxFileSize`: in bytes
 * - `hint`: text under the prompt
 * - `name`: for plain form posts
 *
 * By hand, with Ark's parts:
 *
 *   <FileUpload.Root maxFiles={3}>
 *     <FileUpload.Dropzone>Drop here <FileUpload.Trigger>or browse</FileUpload.Trigger></FileUpload.Dropzone>
 *     <FileUpload.ItemGroup>
 *       <FileUpload.Context>{(api) => api.acceptedFiles.map((file) => (
 *         <FileUpload.Item key={file.name} file={file}>
 *           <FileUpload.ItemName /> <FileUpload.ItemSizeText /> <FileUpload.ItemDeleteTrigger>×</FileUpload.ItemDeleteTrigger>
 *         </FileUpload.Item>
 *       ))}</FileUpload.Context>
 *     </FileUpload.ItemGroup>
 *     <FileUpload.HiddenInput />
 *   </FileUpload.Root>
 */
import { useEffect, useMemo, type ReactNode } from 'react'
import { FileUpload as Ark, type FileUploadFileAcceptDetails } from '@ark-ui/react/file-upload'
import { useFieldContext } from '@ark-ui/react/field'
import 'iconify-icon'
import { cx, partsOf, useControllable, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './file-upload.css'

export type FileUploadProps = Omit<Ark.RootProps, 'acceptedFiles' | 'defaultAcceptedFiles' | 'onFileAccept' | 'label'> & {
  label?: ReactNode
  files?: File[]
  defaultFiles?: File[]
  onFilesChange?: (files: File[]) => void
  hint?: ReactNode
  classes?: Classes<'root' | 'label' | 'dropzone' | 'icon' | 'prompt' | 'trigger' | 'hint' | 'itemGroup' | 'item'
    | 'itemPreview' | 'itemName' | 'size' | 'reason' | 'itemDeleteTrigger'>
}

const size = (bytes: number) =>
  bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1048576).toFixed(1)} MB`
const reasons: Record<string, string> = {
  FILE_INVALID_TYPE: 'Not an allowed type', FILE_TOO_LARGE: 'Too large', TOO_MANY_FILES: 'Too many files', FILE_TOO_SMALL: 'Too small',
}

// Object URLs for image previews, revoked when the files go.
function usePreviews(files: File[]) {
  const urls = useMemo(() => new Map(files.filter((f) => f.type.startsWith('image/')).map((f) => [f, URL.createObjectURL(f)])), [files])
  useEffect(() => () => urls.forEach((url) => URL.revokeObjectURL(url)), [urls])
  return urls
}

function FileUploadShortcut({
  label = null, files, defaultFiles, onFilesChange, maxFiles = 1, hint = null, className, classes, ...rest
}: FileUploadProps) {
  const field = useFieldContext()
  const part = partsOf('file-upload', classes)
  const [accepted, setAccepted] = useControllable<File[]>(files, defaultFiles ?? [], undefined)
  const previews = usePreviews(accepted)

  // From onFileAccept, which Zag calls whenever the accepted files change.
  // (onFileChange also fires for rejections, carrying the accepted files as
  // they were before this render: it would undo a drop of good and bad files.)
  function accept(details: FileUploadFileAcceptDetails) {
    setAccepted(details.files)
    onFilesChange?.(details.files)
  }

  return (
    <Ark.Root {...rest} {...part('root')} className={cx(className, classes?.root)} maxFiles={maxFiles}
      acceptedFiles={accepted} onFileAccept={accept}>
      {label && !field && <Ark.Label {...part('label')}>{label}</Ark.Label>}
      <Ark.Dropzone {...part('dropzone')}>
        <iconify-icon {...part('icon')} icon="lucide:upload" aria-hidden="true" />
        <span {...part('prompt')}>
          Drop {maxFiles > 1 ? 'files' : 'a file'} here or <Ark.Trigger {...part('trigger')}>browse</Ark.Trigger>
        </span>
        {hint && <span {...part('hint')}>{hint}</span>}
      </Ark.Dropzone>
      <Ark.HiddenInput />

      <Ark.Context>{(api) => (api.acceptedFiles.length > 0 || api.rejectedFiles.length > 0) && (
        <Ark.ItemGroup {...part('item-group')}>
          {api.acceptedFiles.map((file) => (
            <Ark.Item key={`${file.name}:${file.lastModified}`} file={file} {...part('item')}>
              <Ark.ItemPreview type=".*" {...part('item-preview')}>
                {previews.has(file) ? <img src={previews.get(file)} alt="" /> : <iconify-icon icon="lucide:file" aria-hidden="true" />}
              </Ark.ItemPreview>
              <Ark.ItemName {...part('item-name')} />
              <span {...part('size')}>{size(file.size)}</span>
              <Ark.ItemDeleteTrigger {...part('item-delete-trigger')}><iconify-icon icon="lucide:x" /></Ark.ItemDeleteTrigger>
            </Ark.Item>
          ))}
          {api.rejectedFiles.map(({ file, errors }) => (
            <Ark.Item key={`${file.name}:${file.lastModified}`} file={file} {...part('item')} data-rejected="">
              <Ark.ItemPreview type=".*" {...part('item-preview')}><iconify-icon icon="lucide:file-x" aria-hidden="true" /></Ark.ItemPreview>
              <Ark.ItemName {...part('item-name')} />
              <span {...part('reason')}>{errors.map((e) => reasons[e] ?? e).join(', ')}</span>
              <Ark.ItemDeleteTrigger {...part('item-delete-trigger')}><iconify-icon icon="lucide:x" /></Ark.ItemDeleteTrigger>
            </Ark.Item>
          ))}
        </Ark.ItemGroup>
      )}</Ark.Context>
    </Ark.Root>
  )
}

export const FileUpload = withParts(FileUploadShortcut, {
  Root: Ark.Root,
  Label: Ark.Label,
  Dropzone: Ark.Dropzone,
  Trigger: Ark.Trigger,
  ItemGroup: Ark.ItemGroup,
  Item: Ark.Item,
  ItemPreview: Ark.ItemPreview,
  ItemPreviewImage: Ark.ItemPreviewImage,
  ItemName: Ark.ItemName,
  ItemSizeText: Ark.ItemSizeText,
  ItemDeleteTrigger: Ark.ItemDeleteTrigger,
  ClearTrigger: Ark.ClearTrigger,
  HiddenInput: Ark.HiddenInput,
  Context: Ark.Context,
})
