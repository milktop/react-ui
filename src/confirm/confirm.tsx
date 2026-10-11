/**
 * Asks before doing something, from anywhere: a dialog you `await` for a yes
 * or no, with no state to keep and nothing to put in the layout.
 *
 *   if (await confirm({ heading: 'Archive Ada?', confirmLabel: 'Archive' })) archive(ada)
 *
 *   await confirm({
 *     heading: 'Delete Ada Lovelace?', description: 'Her lessons and invoices go too.',
 *     danger: true, confirmLabel: 'Delete', typeToConfirm: 'Ada Lovelace',
 *     onConfirm: () => api.delete(ada.id),   // the button spins until it's done
 *   })
 *
 * Resolves true when confirmed, false when cancelled (Cancel, Escape or the
 * close button). Calls made while one is open wait their turn.
 *
 * - `heading`, `description` (text or markup); `content`: more under them
 * - `confirmLabel` ('Confirm'), `cancelLabel` ('Cancel'; null for none, an
 *   acknowledgement)
 * - `danger`: a red confirm button, for things that can't be undone
 * - `typeToConfirm`: text to type before the button enables
 * - `onConfirm`: runs before it closes, with the button loading; if it
 *   throws, the dialog stays open and shows the error's message
 * - `size`: the dialog's size ('sm')
 *
 * It renders into its own root at the end of <body> the first time it's
 * used (the library's CSS and tokens apply there too).
 */
import { useState, useSyncExternalStore, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { Dialog } from '../dialog/Dialog.js'
import { Button } from '../button/Button.js'
import { Input } from '../input/Input.js'
import { Alert } from '../alert/Alert.js'
import { partsOf } from '../utils.js'
import { AmbientLocale, useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './confirm.css'

export type ConfirmOptions = {
  heading: ReactNode
  description?: ReactNode
  content?: ReactNode
  confirmLabel?: ReactNode
  cancelLabel?: ReactNode | null
  danger?: boolean
  typeToConfirm?: string | null
  onConfirm?: (() => unknown) | null
  size?: 'sm' | 'md' | 'lg'
}

type Request = ConfirmOptions & { id: number, resolve: (confirmed: boolean) => void }

// The open request first, then the ones waiting.
let queue: Request[] = []
let nextId = 1
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

let mounted = false
function mount() {
  if (mounted || typeof document === 'undefined') return
  mounted = true
  const host = document.createElement('div')
  host.setAttribute('data-confirm-host', '')
  document.body.appendChild(host)
  createRoot(host).render(<ConfirmHost />)
}

export function confirm(options: ConfirmOptions): Promise<boolean> {
  mount()
  return new Promise((resolve) => {
    queue = [...queue, { ...options, id: nextId++, resolve }]
    emit()
  })
}

// Gone from the queue once its dialog has animated out.
function remove(request: Request) {
  queue = queue.filter((other) => other !== request)
  emit()
}

function ConfirmHost() {
  const current = useSyncExternalStore(subscribe, () => queue[0] ?? null, () => null)
  // A new dialog per request, so each starts with its own state.
  return current ? <AmbientLocale><ConfirmDialog key={current.id} request={current} /></AmbientLocale> : null
}

function ConfirmDialog({ request }: { request: Request }) {
  const {
    heading, description = null, content = null, confirmLabel: confirmLabelProp, cancelLabel: cancelLabelProp, danger = false,
    typeToConfirm = null, onConfirm = null, size = 'sm',
  } = request
  const t = useMessages()
  const confirmLabel = confirmLabelProp ?? t.common.confirm
  const cancelLabel = cancelLabelProp === undefined ? t.common.cancel : cancelLabelProp
  const part = partsOf('confirm')
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(true)
  // Answers once: resolves the promise, then closes.
  function settle(confirmed: boolean) {
    if (!open) return
    request.resolve(confirmed)
    setOpen(false)
  }
  const ready = !typeToConfirm || typed.trim() === typeToConfirm

  async function yes() {
    if (!ready || busy) return
    if (onConfirm) {
      setBusy(true)
      setError(null)
      try {
        await onConfirm()
      } catch (e) {
        setBusy(false)
        setError(e instanceof Error ? e.message : String(e))
        return
      }
    }
    settle(true)
  }

  return (
    <Dialog alert open={open} onExitComplete={() => remove(request)} size={size} heading={heading} description={description}
      // Closing any other way (Escape, the close button) is a no, unless it's still working;
      // it stays open (it's controlled) until it settles.
      onOpenChange={(open) => { if (!open && !busy) settle(false) }}
      footer={<>
        {cancelLabel !== null && <Button disabled={busy} onClick={() => settle(false)}>{cancelLabel}</Button>}
        <Button variant={danger ? 'danger' : 'primary'} disabled={!ready} loading={busy} onClick={yes}>{confirmLabel}</Button>
      </>}>
      {(content || typeToConfirm || error) && (
        <div {...part('body')}>
          {content}
          {typeToConfirm && (
            <form {...part('type')} onSubmit={(e) => { e.preventDefault(); yes() }}>
              <span {...part('type-label')}>{t.confirm.typePrefix} <strong>{typeToConfirm}</strong> {t.confirm.typeSuffix}</span>
              <Input value={typed} onValueChange={setTyped} autoFocus autoComplete="off" aria-label={t.confirm.typeToConfirm(typeToConfirm)} />
            </form>
          )}
          {error && <Alert variant="danger">{error}</Alert>}
        </div>
      )}
    </Dialog>
  )
}
