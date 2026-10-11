/**
 * Copies `value` to the clipboard, then shows a tick and "Copied" for a moment.
 *
 *   <CopyButton value={bookingLink} />
 *   <Input value={bookingLink} readOnly end={<CopyButton value={bookingLink} iconOnly />} />
 *
 * - `value`: the text it copies
 * - `label`, `copiedLabel`: the text ('Copy' and 'Copied'); `iconOnly` hides
 *   it (it stays the accessible name)
 * - `timeout`: how long it shows "Copied" (2000 ms)
 * - `onCopy`: called with the value once it is copied
 *
 * Other attributes go on the <button>. By hand, Ark's Clipboard parts
 * (Clipboard.Root, Trigger, Indicator…) from '@ark-ui/react/clipboard'.
 */
import type { ComponentProps } from 'react'
import { Clipboard, useClipboard } from '@ark-ui/react/clipboard'
import 'iconify-icon'
import { cx, partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './copy-button.css'

export type CopyButtonProps = Omit<ComponentProps<'button'>, 'value' | 'onCopy'> & {
  value?: string | number | null
  label?: string
  copiedLabel?: string
  iconOnly?: boolean
  timeout?: number
  onCopy?: ((value: string) => void) | null
  classes?: Classes<'trigger' | 'icon' | 'text'>
}

export function CopyButton({
  value = '', label = 'Copy', copiedLabel = 'Copied', iconOnly = false, timeout = 2000, onCopy = null,
  className, classes, ...rest
}: CopyButtonProps) {
  // Ark's clipboard stamps data-scope="clipboard"; ours goes last, for copy-button.css.
  const part = partsOf('copy-button', classes)
  const text = String(value ?? '')
  const clipboard = useClipboard({
    value: text, timeout,
    onStatusChange: (details) => { if (details.copied) onCopy?.(text) },
  })
  const shown = clipboard.copied ? copiedLabel : label

  return (
    <Clipboard.RootProvider value={clipboard} asChild>
      <span style={{ display: 'contents' }}>
        <Clipboard.Trigger {...rest} {...part('trigger')} className={cx(className, classes?.trigger)}
          data-icon-only={iconOnly || undefined} aria-label={iconOnly ? shown : undefined}>
          <iconify-icon {...part('icon')} icon={clipboard.copied ? 'lucide:check' : 'lucide:copy'} aria-hidden="true" />
          {!iconOnly && <span {...part('text')} aria-live="polite">{shown}</span>}
        </Clipboard.Trigger>
      </span>
    </Clipboard.RootProvider>
  )
}
