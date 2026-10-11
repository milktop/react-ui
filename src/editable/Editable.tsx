/**
 * Text you click to edit in place, e.g. a pet's name or a price on a details
 * page: it reads as text until clicked, then Enter saves and Escape cancels.
 *
 *   <Editable value={pet.name} onValueChange={(name) => save({ name })} />
 *
 * - `value`, `defaultValue`: the saved text; `onValueChange`: called with it
 *   when an edit is saved (not on each key)
 * - `placeholder`: shown when it's empty
 * - `label`: a label above it (skipped inside a Field)
 * - `activationMode`: 'click' (default), 'dblclick' or 'focus'
 * - `controls`: ✓ and ✕ buttons while editing (true); `submitMode`: 'enter'
 *   (default), 'blur', 'both' or 'none' saves on those
 * - `disabled`, `readOnly`
 *
 * By hand, Ark's parts are here too: Editable.Root, Area, Input, Preview,
 * Control, EditTrigger, SubmitTrigger, CancelTrigger, Label.
 */
import { useState, type ReactNode } from 'react'
import { Editable as Ark } from '@ark-ui/react/editable'
import { useFieldContext } from '@ark-ui/react/field'
import 'iconify-icon'
import { cx, partsOf, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './editable.css'

export type EditableProps = Omit<Ark.RootProps, 'value' | 'defaultValue' | 'onValueChange' | 'onValueCommit' | 'onValueRevert'> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  label?: ReactNode
  controls?: boolean
  classes?: Classes<'root' | 'label' | 'area' | 'input' | 'preview' | 'control' | 'editTrigger' | 'submitTrigger' | 'cancelTrigger'>
}

function EditableShortcut({
  value, defaultValue = '', onValueChange, label = null, controls = true, activationMode = 'click', placeholder,
  className, classes, ...rest
}: EditableProps) {
  const field = useFieldContext()
  const part = partsOf('editable', classes)
  // The saved text (ours, or the caller's), and the draft being typed.
  const [own, setOwn] = useState(defaultValue)
  const saved = value ?? own
  const [draft, setDraft] = useState(saved)
  const [editing, setEditing] = useState(false)
  // A new saved value from outside shows when not editing.
  const [seen, setSeen] = useState(saved)
  if (saved !== seen) {
    setSeen(saved)
    if (!editing) setDraft(saved)
  }

  return (
    <Ark.Root {...rest} {...part('root')} className={cx(className, classes?.root)} activationMode={activationMode}
      {...(placeholder !== undefined && { placeholder })}
      value={draft} onValueChange={(d) => setDraft(d.value)} edit={editing} onEditChange={(d) => setEditing(d.edit)}
      onValueCommit={(d) => { if (value === undefined) setOwn(d.value); if (d.value !== saved) onValueChange?.(d.value) }}
      onValueRevert={() => setDraft(saved)}>
      {label && !field && <Ark.Label {...part('label')}>{label}</Ark.Label>}
      <div {...part('row')}>
        <Ark.Area {...part('area')}>
          <Ark.Input {...part('input')} />
          <Ark.Preview {...part('preview')} />
        </Ark.Area>
        {controls && (
          <Ark.Control {...part('control')}>
            {editing ? <>
              <Ark.SubmitTrigger {...part('submit-trigger')} aria-label="Save"><iconify-icon icon="lucide:check" /></Ark.SubmitTrigger>
              <Ark.CancelTrigger {...part('cancel-trigger')} aria-label="Cancel"><iconify-icon icon="lucide:x" /></Ark.CancelTrigger>
            </> : <Ark.EditTrigger {...part('edit-trigger')} aria-label="Edit"><iconify-icon icon="lucide:pencil" /></Ark.EditTrigger>}
          </Ark.Control>
        )}
      </div>
    </Ark.Root>
  )
}

export const Editable = withParts(EditableShortcut, {
  Root: Ark.Root, RootProvider: Ark.RootProvider, Area: Ark.Area, Input: Ark.Input, Preview: Ark.Preview, Control: Ark.Control,
  EditTrigger: Ark.EditTrigger, SubmitTrigger: Ark.SubmitTrigger, CancelTrigger: Ark.CancelTrigger, Label: Ark.Label, Context: Ark.Context,
})
