/**
 * A textarea that grows with its content, from `rows` lines up to `maxRows`
 * (then it scrolls). Other attributes go on the <textarea>.
 *
 *   <Textarea value={notes} onValueChange={setNotes} rows={3} maxRows={8} placeholder="Notes" />
 *
 * - `label`: a label above it (skipped inside a Field)
 * - `value`, `defaultValue`; `onValueChange`: called with the new text
 * - `rows`: the starting height in lines
 * - `maxRows`: grow up to this many lines, then scroll
 * - `autogrow`: false for a fixed height the user can resize
 */
import { useCallback, useId, useLayoutEffect, useRef, type ChangeEvent, type ComponentProps, type ReactNode } from 'react'
import { Field, useFieldContext } from '@ark-ui/react/field'
import { cx, partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './textarea.css'

export type TextareaProps = ComponentProps<'textarea'> & {
  label?: ReactNode
  onValueChange?: (value: string) => void
  maxRows?: number | null
  autogrow?: boolean
  classes?: Classes<'root' | 'label' | 'control' | 'textarea'>
}

export function Textarea({
  label = null, rows = 3, maxRows = null, autogrow = true, onValueChange, onChange, value,
  className, classes, ref, ...rest
}: TextareaProps) {
  const field = useFieldContext()
  const part = partsOf('textarea', classes)
  const ownId = useId()
  const id = rest.id ?? `${ownId}-textarea`
  const el = useRef<HTMLTextAreaElement | null>(null)

  // Fits the height to the content, capped at maxRows.
  const fit = useCallback(() => {
    const area = el.current
    if (!autogrow || !area) return
    const line = parseFloat(getComputedStyle(area).lineHeight)
    const max = maxRows ? line * maxRows : Infinity
    area.style.height = 'auto'
    area.style.height = `${Math.min(area.scrollHeight, max)}px`
    area.style.overflowY = area.scrollHeight > max ? 'auto' : 'hidden'
  }, [autogrow, maxRows])
  useLayoutEffect(fit, [fit, value])

  function change(e: ChangeEvent<HTMLTextAreaElement>) {
    onChange?.(e)
    onValueChange?.(e.target.value)
    fit()
  }

  // Both refs: ours, for the height, and the caller's.
  const refs = (node: HTMLTextAreaElement | null) => {
    el.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  return (
    <div {...part('root')} className={cx(className, classes?.root)}>
      {label && !field && <label {...part('label')} htmlFor={id}>{label}</label>}
      <div {...part('control')}>
        {/* Inside a Field, Field.Textarea takes its id and describes itself by its hint or error. */}
        <Field.Textarea ref={refs} rows={rows} id={field ? undefined : id} value={value} {...rest} {...part('textarea')}
          data-autogrow={autogrow || undefined} onChange={change} />
      </div>
    </div>
  )
}
