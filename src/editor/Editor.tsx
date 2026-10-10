/**
 * A rich text editor on TipTap (ProseMirror): a toolbar over an editable area
 * whose value is HTML.
 *
 *   <Editor label="Notes" placeholder="Lesson notes…" value={notes} onValueChange={setNotes} />
 *
 * Inside a Field it takes the field's label, hint and error.
 *
 * - `value`, `defaultValue`: the HTML ('' when empty); `onValueChange`
 * - `label`: a label above it (skipped inside a Field)
 * - `tools`: which toolbar buttons, in order ('|' for a divider): bold,
 *   italic, underline, strike, code, h2, h3, bulletList, orderedList,
 *   blockquote, link, image, undo, redo
 * - `toolbar`: false hides the toolbar
 * - `placeholder`: shown while it's empty
 * - `maxLength`: a character limit, with a counter
 * - `minHeight`, `maxHeight`: CSS lengths; it scrolls past maxHeight
 * - `disabled`: read only
 * - `uploadImage`: an async function taking a File and returning its URL, or
 *   `{ src, alt, title, data-* }` (data-* kept on the <img>, e.g. a signed id
 *   for your server). With it, images can be dropped, pasted or picked with
 *   the image button, and are inserted once uploaded; without it, dropped
 *   and pasted files are ignored. A failed upload calls `onError`
 * - `editorRef`: a ref given the TipTap editor, for anything more
 *
 * Keyboard shortcuts are TipTap's (⌘B, ⌘I, ⌘U, ⌘⇧7/8 for lists, ⌘Z…).
 */
import { useEffect, useId, useReducer, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent, type HTMLAttributes, type ReactNode, type RefObject } from 'react'
import { Editor as TipTap, type ChainedCommands } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder, CharacterCount } from '@tiptap/extensions'
import { useFieldContext } from '@ark-ui/react/field'
import 'iconify-icon'
import { RichImage } from './image.js'
import { Popover } from '../popover/Popover.js'
import { Input } from '../input/Input.js'
import { Button } from '../button/Button.js'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import '../theme.css'
import './editor.css'

export type EditorTool = 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'h2' | 'h3' | 'bulletList' | 'orderedList'
  | 'blockquote' | 'link' | 'image' | 'undo' | 'redo' | '|'
export type UploadedImage = string | { src: string, alt?: string, title?: string, [data: `data-${string}`]: string }

export const defaultTools: EditorTool[] = ['bold', 'italic', 'underline', 'strike', '|', 'h2', 'h3', '|', 'bulletList', 'orderedList', 'blockquote', '|', 'link', 'image', '|', 'undo', 'redo']

type Tool = { icon: string, label: string, run: (c: ChainedCommands) => ChainedCommands, active?: [string, object?], can?: 'undo' | 'redo' }

// Each tool: its icon and label, how it runs, and when it's active.
const toolDefs: Partial<Record<EditorTool, Tool>> = {
  bold: { icon: 'lucide:bold', label: 'Bold', run: (c) => c.toggleBold(), active: ['bold'] },
  italic: { icon: 'lucide:italic', label: 'Italic', run: (c) => c.toggleItalic(), active: ['italic'] },
  underline: { icon: 'lucide:underline', label: 'Underline', run: (c) => c.toggleUnderline(), active: ['underline'] },
  strike: { icon: 'lucide:strikethrough', label: 'Strikethrough', run: (c) => c.toggleStrike(), active: ['strike'] },
  code: { icon: 'lucide:code', label: 'Code', run: (c) => c.toggleCode(), active: ['code'] },
  h2: { icon: 'lucide:heading-2', label: 'Heading', run: (c) => c.toggleHeading({ level: 2 }), active: ['heading', { level: 2 }] },
  h3: { icon: 'lucide:heading-3', label: 'Subheading', run: (c) => c.toggleHeading({ level: 3 }), active: ['heading', { level: 3 }] },
  bulletList: { icon: 'lucide:list', label: 'Bulleted list', run: (c) => c.toggleBulletList(), active: ['bulletList'] },
  orderedList: { icon: 'lucide:list-ordered', label: 'Numbered list', run: (c) => c.toggleOrderedList(), active: ['orderedList'] },
  blockquote: { icon: 'lucide:text-quote', label: 'Quote', run: (c) => c.toggleBlockquote(), active: ['blockquote'] },
  undo: { icon: 'lucide:undo-2', label: 'Undo', run: (c) => c.undo(), can: 'undo' },
  redo: { icon: 'lucide:redo-2', label: 'Redo', run: (c) => c.redo(), can: 'redo' },
}

export type EditorProps = Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onError'> & {
  value?: string
  defaultValue?: string
  onValueChange?: (html: string) => void
  label?: ReactNode
  placeholder?: string
  tools?: EditorTool[]
  toolbar?: boolean
  maxLength?: number | null
  minHeight?: string
  maxHeight?: string | null
  disabled?: boolean
  uploadImage?: ((file: File) => Promise<UploadedImage | null | undefined>) | null
  onError?: (error: unknown) => void
  editorRef?: RefObject<TipTap | null>
  classes?: Classes<'label' | 'root' | 'toolbar' | 'divider' | 'tool' | 'imageInput' | 'content' | 'uploading' | 'count' | 'linkForm' | 'linkActions'>
}

// A URL, or { src, alt, title, data-*… }, as the image node's attributes.
function imageAttrs(result: UploadedImage | null | undefined, file: File) {
  if (!result) return null
  if (typeof result === 'string') return { src: result, alt: file.name }
  const data = Object.fromEntries(Object.entries(result).filter(([key]) => key.startsWith('data-')))
  return { src: result.src, alt: result.alt ?? file.name, title: result.title ?? null, data: Object.keys(data).length ? data : null }
}

export function Editor({
  value, defaultValue = '', onValueChange, label = null, placeholder = '', tools = defaultTools, toolbar = true, maxLength = null,
  minHeight = '8rem', maxHeight = null, disabled = false, uploadImage = null, onError, editorRef,
  className, classes, ...rest
}: EditorProps) {
  const field = useFieldContext()
  const part = partsOf('editor', classes)
  const id = useId()
  const labelId = field ? field.ids.label : label ? `${id}-label` : undefined
  const [current, setCurrent] = useControllable(value, defaultValue, onValueChange)

  const contentEl = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<TipTap | null>(null)
  const [focused, setFocused] = useState(false)
  const [uploading, setUploading] = useState(0)
  // Bumped on every transaction, so the toolbar's states re-read the editor.
  const [, bump] = useReducer((n: number) => n + 1, 0)
  // The HTML the editor last had, to tell its own changes from new values.
  const html = useRef(current ?? '')

  // The latest props, for the editor's callbacks (it's made once).
  const latest = useRef({ setCurrent, placeholder, uploadImage, onError, labelId, field })
  useEffect(() => { latest.current = { setCurrent, placeholder, uploadImage, onError, labelId, field } })

  // Uploads the images among `files` and inserts each at `pos` (or the cursor) as it arrives.
  async function insertImages(instance: TipTap, files: File[], pos: number | null = null) {
    const upload = latest.current.uploadImage
    if (!upload) return
    for (const file of files.filter((f) => (f.type ?? '').startsWith('image/'))) {
      setUploading((n) => n + 1)
      try {
        const attrs = imageAttrs(await upload(file), file)
        if (attrs && !instance.isDestroyed) instance.chain().focus().insertContentAt(pos ?? instance.state.selection.to, { type: 'image', attrs }).run()
      } catch (error) {
        latest.current.onError?.(error)
      }
      setUploading((n) => n - 1)
    }
  }
  const insert = useRef(insertImages)
  useEffect(() => { insert.current = insertImages })

  // Made once; the effects below keep it in step with the props.
  useEffect(() => {
    const instance = new TipTap({
      element: contentEl.current,
      content: html.current,
      editable: !disabled,
      extensions: [
        StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true } }),
        Placeholder.configure({ placeholder: () => latest.current.placeholder }),
        CharacterCount.configure({ limit: maxLength }),
        RichImage,
      ],
      editorProps: {
        // Files dropped or pasted: images go to `uploadImage`; anything else
        // is ignored, so the browser doesn't open the file in the tab.
        handleDrop(view, event, _slice, moved) {
          const files = Array.from(event.dataTransfer?.files ?? [])
          if (moved || !files.length) return false
          event.preventDefault()
          insert.current(instance, files, view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? null)
          return true
        },
        handlePaste(_view, event) {
          const files = Array.from(event.clipboardData?.files ?? [])
          if (!files.length) return false
          insert.current(instance, files)
          return true
        },
        // Read on every update, so the field's label and messages follow.
        attributes: () => ({
          role: 'textbox', 'aria-multiline': 'true',
          'aria-labelledby': latest.current.labelId ?? '', 'aria-describedby': latest.current.field?.ariaDescribedby ?? '',
          'aria-invalid': latest.current.field?.invalid ? 'true' : 'false',
        }),
      },
      onCreate: () => setEditor(instance),
      onUpdate: ({ editor }) => {
        html.current = editor.isEmpty ? '' : editor.getHTML()
        latest.current.setCurrent(html.current)
      },
      onTransaction: bump,
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    })
    if (editorRef) editorRef.current = instance
    return () => {
      instance.destroy()
      if (editorRef) editorRef.current = null
      setEditor(null)
    }
    // Made once: maxLength and the rest are read when it's created.
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // A new value from outside (not the editor's own) replaces the content.
  useEffect(() => {
    if (editor && (current ?? '') !== html.current) {
      html.current = current ?? ''
      editor.commands.setContent(html.current, { emitUpdate: false })
    }
  }, [editor, current])
  useEffect(() => { if (editor && editor.isEditable === disabled) editor.setEditable(!disabled) }, [editor, disabled])
  // ProseMirror reads its attributes on updates; refresh them when the field changes.
  useEffect(() => { editor?.view.setProps({}) }, [editor, labelId, field?.ariaDescribedby, field?.invalid])

  const isActive = (tool: Tool) => !!editor && !!tool.active && editor.isActive(...(tool.active as [string, object?]))
  const canRun = (tool: Tool) => !!editor && !disabled && (tool.can ? editor.can()[tool.can]() : true)
  const run = (tool: Tool) => editor && tool.run(editor.chain().focus()).run()
  const characters = editor ? editor.storage.characterCount.characters() : 0

  // The link popover: the current link's address, applied or removed.
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const linkActive = !!editor?.isActive('link')
  function openLink(open: boolean) {
    if (open) setLinkUrl(editor?.getAttributes('link')?.href ?? '')
    setLinkOpen(open)
  }

  function applyLink(e: FormEvent) {
    e.preventDefault()
    if (!editor) return
    const url = linkUrl.trim()
    const chain = editor.chain().focus().extendMarkRange('link')
    if (url) chain.setLink({ href: /^[a-z]+:/i.test(url) ? url : `https://${url}` }).run()
    else chain.unsetLink().run()
    setLinkOpen(false)
  }

  function removeLink() {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run()
    setLinkOpen(false)
  }

  function pickedImages(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (editor) insertImages(editor, files)
  }

  // Toolbar buttons keep the editor's selection (no focus on mousedown).
  const keepFocus = (e: { preventDefault: () => void }) => e.preventDefault()

  return <>
    {label && !field && <span {...part('label')} id={labelId}>{label}</span>}
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} data-focused={focused || undefined}
      data-disabled={disabled || undefined} data-invalid={field?.invalid || undefined}>
      {toolbar && !disabled && (
        <div {...part('toolbar')} role="toolbar" aria-label="Formatting">
          {tools.map((name, i) => {
            if (name === '|') return <span key={`d${i}`} {...part('divider')} />
            if (name === 'link') return (
              <Popover key={name} placement="bottom-start" open={linkOpen} onOpenChange={openLink} trigger={
                <button {...part('tool')} type="button" aria-label="Link" aria-pressed={linkActive} onMouseDown={keepFocus}>
                  <iconify-icon icon="lucide:link" aria-hidden="true" />
                </button>
              }>
                <form {...part('link-form')} onSubmit={applyLink}>
                  <Input size="sm" icon="lucide:link" placeholder="https://…" value={linkUrl} onValueChange={setLinkUrl} />
                  <div {...part('link-actions')}>
                    {linkActive && <Button size="sm" variant="ghost" onClick={removeLink}>Remove</Button>}
                    <Button size="sm" variant="primary" type="submit">Apply</Button>
                  </div>
                </form>
              </Popover>
            )
            if (name === 'image') return uploadImage && (
              <label key={name} {...part('tool')} aria-label="Image" onMouseDown={keepFocus}>
                <input {...part('image-input')} type="file" accept="image/*" multiple onChange={pickedImages} />
                <iconify-icon icon="lucide:image" aria-hidden="true" />
              </label>
            )
            const tool = toolDefs[name]
            return tool && (
              <button key={name} {...part('tool')} type="button" aria-label={tool.label} aria-pressed={tool.active ? isActive(tool) : undefined}
                disabled={!canRun(tool)} onMouseDown={keepFocus} onClick={() => run(tool)}>
                <iconify-icon icon={tool.icon} aria-hidden="true" />
              </button>
            )
          })}
        </div>
      )}
      <div {...part('content')} ref={contentEl}
        style={{ '--min-height': minHeight, '--max-height': maxHeight ?? 'none' } as CSSProperties} />
      {uploading > 0 && <div {...part('uploading')}>Uploading…</div>}
      {maxLength && <div {...part('count')} data-over={characters >= maxLength || undefined}>{characters} / {maxLength}</div>}
    </div>
  </>
}
