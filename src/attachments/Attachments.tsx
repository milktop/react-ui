/**
 * The files added to a page or form, as a grid of tiles (image thumbnails, or
 * an icon and the extension) or a compact list.
 *
 *   <Attachments items={files} onItemsChange={setFiles} removable addable />
 *
 * - `items`, `defaultItems`; `onItemsChange`: called with the new list. Plain
 *   objects `{ name, size (bytes, or text), type (MIME), url, thumb }` or File
 *   objects (e.g. from FileUpload or an <input type=file>), which are
 *   previewed locally
 * - `layout`: 'grid' (default) or 'list'
 * - `columns`: the most tiles per row in the grid; fewer when tiles would get
 *   too small (without it, as many as fit)
 * - `removable`: a remove button on each; `onRemove` gets the item
 * - `addable`: an "Add files" tile that opens the file picker, and files can
 *   be dropped onto the attachments; `onAdd` gets the Files
 * - `accept` (MIME types or extensions, e.g. 'image/*,.pdf'), `maxFiles` and
 *   `maxFileSize` (bytes) limit what's added; files that don't fit are listed
 *   with the reason, and `onReject` gets `[{ file, reason }]`
 * - `addLabel`, `emptyText`
 *
 * Clicking an image opens it large; other files open their `url`, if any, in
 * a new tab. Files with a `url` get a download button.
 */
import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type DragEvent, type HTMLAttributes, type ReactNode } from 'react'
import 'iconify-icon'
import { Dialog } from '../dialog/Dialog.js'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import '../theme.css'
import './attachments.css'

export type Attachment = File | { name?: string, size?: number | string, type?: string, url?: string, thumb?: string }
export type AttachmentRejection = { file: File, reason: string }

export type AttachmentsProps = Omit<HTMLAttributes<HTMLDivElement>, 'onDrop'> & {
  items?: Attachment[]
  defaultItems?: Attachment[]
  onItemsChange?: (items: Attachment[]) => void
  layout?: 'grid' | 'list'
  columns?: number | null
  removable?: boolean
  addable?: boolean
  accept?: string | null
  maxFiles?: number | null
  maxFileSize?: number | null
  addLabel?: ReactNode
  emptyText?: ReactNode
  onRemove?: (item: Attachment) => void
  onAdd?: (files: File[]) => void
  onReject?: (rejected: AttachmentRejection[]) => void
  classes?: Classes<'root' | 'empty' | 'files' | 'file' | 'open' | 'thumb' | 'icon' | 'ext' | 'meta' | 'name' | 'size' | 'actions'
    | 'action' | 'addTile' | 'addInput' | 'addIcon' | 'addText' | 'addLabel' | 'limit' | 'rejected' | 'dropHint' | 'preview' | 'downloadLink'>
}

type Entry = { item: Attachment, name: string, url?: string, image: boolean, size: string, thumb: string | null, ext: string, icon: string }

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${Number((bytes / 1024 / 1024).toFixed(1))} MB`
}

function iconFor(type: string, name: string) {
  const n = name.toLowerCase()
  if (type.startsWith('image/') || /\.(jpe?g|png|gif|webp|avif|svg)$/.test(n)) return 'lucide:image'
  if (type.startsWith('video/') || /\.(mp4|mov|webm)$/.test(n)) return 'lucide:file-video'
  if (type.startsWith('audio/') || /\.(mp3|wav|m4a)$/.test(n)) return 'lucide:file-audio'
  if (/\.(xlsx?|csv|numbers)$/.test(n)) return 'lucide:file-spreadsheet'
  if (/\.(zip|rar|7z|gz)$/.test(n)) return 'lucide:file-archive'
  if (/\.(pdf|docx?|txt|md|pages|rtf)$/.test(n)) return 'lucide:file-text'
  return 'lucide:file'
}

// Local previews for Files, made once each.
const urls = new WeakMap<File, string>()
function localUrl(file: File) {
  if (!urls.has(file)) urls.set(file, URL.createObjectURL(file))
  return urls.get(file)!
}

// One shape for both plain objects and Files.
function info(item: Attachment): Entry {
  const file = typeof File !== 'undefined' && item instanceof File ? item : null
  const url = file ? localUrl(file) : (item as Exclude<Attachment, File>).url
  const type = item.type ?? ''
  const name = item.name || 'Untitled'
  const image = type.startsWith('image/') || /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(name)
  return {
    item, name, url, image,
    size: typeof item.size === 'number' ? formatSize(item.size) : (item.size ?? ''),
    thumb: (!file && (item as Exclude<Attachment, File>).thumb) || (image ? url ?? null : null),
    ext: (name.match(/\.([a-z0-9]+)$/i)?.[1] ?? '').toUpperCase(),
    icon: iconFor(type, name),
  }
}

// Whether a file matches `accept`: an extension, a type/* or a MIME type.
function accepts(file: File, accept: string | null) {
  if (!accept) return true
  return accept.split(',').map((rule) => rule.trim().toLowerCase()).filter(Boolean).some((rule) =>
    rule.startsWith('.') ? file.name.toLowerCase().endsWith(rule)
      : rule.endsWith('/*') ? (file.type ?? '').startsWith(rule.slice(0, -1))
      : file.type === rule)
}

export function Attachments({
  items: itemsProp, defaultItems = [], onItemsChange, layout = 'grid', columns = null, removable = false, addable = false,
  accept = null, maxFiles = null, maxFileSize = null, addLabel = 'Add files', emptyText = null, onRemove, onAdd, onReject,
  className, classes, style, ...rest
}: AttachmentsProps) {
  const part = partsOf('attachments', classes)
  const [items, setItems] = useControllable(itemsProp, defaultItems, onItemsChange)
  const list = items.map(info)
  const count = items.length
  const atMax = !!maxFiles && count >= maxFiles

  function remove(entry: Entry) {
    setItems(items.filter((item) => item !== entry.item))
    onRemove?.(entry.item)
  }

  // Adds what fits (type, size, count); the rest is rejected with a reason.
  const [rejected, setRejected] = useState<AttachmentRejection[]>([])
  function addFiles(files: File[]) {
    const ok: File[] = []
    const bad: AttachmentRejection[] = []
    for (const file of files) {
      if (!accepts(file, accept)) bad.push({ file, reason: 'not an accepted type' })
      else if (maxFileSize && file.size > maxFileSize) bad.push({ file, reason: `over ${formatSize(maxFileSize)}` })
      else if (maxFiles && count + ok.length >= maxFiles) bad.push({ file, reason: `the limit is ${maxFiles} files` })
      else ok.push(file)
    }
    setRejected(bad)
    if (bad.length) onReject?.(bad)
    if (!ok.length) return
    setItems([...items, ...ok])
    onAdd?.(ok)
  }

  function added(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length) addFiles(files)
  }

  // Dropping files: only while addable, and only for files (not text).
  const root = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const hasFiles = (e: DragEvent) => addable && Array.from(e.dataTransfer?.types ?? []).includes('Files')
  function dragOver(e: DragEvent) {
    if (!hasFiles(e)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = atMax ? 'none' : 'copy'
    setDragging(true)
  }
  function dragLeave(e: DragEvent) {
    if (!root.current?.contains(e.relatedTarget as Node | null)) setDragging(false)
  }
  function dropped(e: DragEvent) {
    if (!hasFiles(e)) return
    e.preventDefault()
    setDragging(false)
    addFiles(Array.from(e.dataTransfer.files ?? []))
  }

  // The add tile would start a row on its own when the files fill their rows;
  // then it becomes a slim full-width row instead of a big empty tile. The
  // column count is read off the grid, so it works for auto-fill grids too.
  const filesEl = useRef<HTMLUListElement>(null)
  const [gridColumns, setGridColumns] = useState(0)
  useEffect(() => {
    const el = filesEl.current
    if (!el) return
    // The observer reports once on observe, then on every resize.
    const observer = new ResizeObserver(() => {
      const tracks = getComputedStyle(el).gridTemplateColumns
      setGridColumns(tracks === 'none' ? 0 : tracks.split(' ').filter(Boolean).length)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [layout, columns, list.length])
  const addWide = layout === 'grid' && gridColumns > 0 && list.length > 0 && list.length % gridColumns === 0

  const [previewing, setPreviewing] = useState<Entry | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  function open(entry: Entry) {
    if (entry.image && entry.url) {
      setPreviewing(entry)
      setPreviewOpen(true)
    } else if (entry.url) window.open(entry.url, '_blank', 'noopener')
  }

  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} ref={root} data-layout={layout}
      data-empty={!list.length || undefined} data-add-wide={addWide || undefined} data-fixed={columns ? '' : undefined}
      style={{ ...style, ...(columns && { '--columns': columns }) } as CSSProperties}
      onDragEnter={dragOver} onDragOver={dragOver} onDragLeave={dragLeave} onDrop={dropped} role="group">
      {!list.length && !addable && emptyText && <p {...part('empty')}>{emptyText}</p>}
      <ul {...part('files')} ref={filesEl}>
        {list.map((entry, i) => (
          <li key={i} {...part('file')}>
            <button {...part('open')} type="button" aria-label={`Open ${entry.name}`} onClick={() => open(entry)}>
              <span {...part('thumb')}>
                {entry.thumb ? <img src={entry.thumb} alt="" loading="lazy" /> : <>
                  <iconify-icon {...part('icon')} icon={entry.icon} aria-hidden="true" />
                  {entry.ext && <span {...part('ext')}>{entry.ext}</span>}
                </>}
              </span>
              <span {...part('meta')}>
                <span {...part('name')}>{entry.name}</span>
                {entry.size && <span {...part('size')}>{entry.size}</span>}
              </span>
            </button>
            <span {...part('actions')}>
              {entry.url && (
                <a {...part('action')} href={entry.url} download={entry.name} aria-label={`Download ${entry.name}`}><iconify-icon icon="lucide:download" /></a>
              )}
              {removable && (
                <button {...part('action')} type="button" aria-label={`Remove ${entry.name}`} onClick={() => remove(entry)}><iconify-icon icon="lucide:x" /></button>
              )}
            </span>
          </li>
        ))}
        {addable && !atMax && (
          <li {...part('file')} data-add="">
            <label {...part('add-tile')}>
              <input {...part('add-input')} type="file" multiple={maxFiles !== 1} {...(accept && { accept })} onChange={added} />
              <span {...part('add-icon')}><iconify-icon icon="lucide:plus" /></span>
              <span {...part('add-text')}>
                <span {...part('add-label')}>{addLabel}</span>
                {!list.length && <span {...part('limit')}>or drop files here</span>}
                {maxFiles && list.length > 0 && <span {...part('limit')}>{count} of {maxFiles}</span>}
              </span>
            </label>
          </li>
        )}
      </ul>
      {rejected.length > 0 && (
        <ul {...part('rejected')} role="alert">
          {rejected.map((item, i) => <li key={i}>{item.file.name} wasn’t added: {item.reason}.</li>)}
        </ul>
      )}
      {dragging && (
        <div {...part('drop-hint')} aria-hidden="true">
          <iconify-icon icon="lucide:upload" />
          <span>{atMax ? `The limit is ${maxFiles} files` : 'Drop to add'}</span>
        </div>
      )}

      <Dialog size="lg" heading={previewing?.name} open={previewOpen} onOpenChange={setPreviewOpen}
        footer={previewing && <a {...part('download-link')} href={previewing.url} download={previewing.name}>Download</a>}>
        {previewing && <img {...part('preview')} src={previewing.url} alt={previewing.name} />}
      </Dialog>
    </div>
  )
}
