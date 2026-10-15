/**
 * A tags input: type and press Enter (or a comma) to add a tag; Backspace
 * removes the last; double-click a tag to edit it.
 *
 *   <TagsInput label="Topics" value={topics} onValueChange={setTopics} placeholder="Add a topic…" />
 *
 * - `value`, `defaultValue`: arrays of strings; `onValueChange`: called with the new array
 * - `max`: the most tags allowed
 * - `variant`: the tags' look: 'subtle', 'accent' or 'outline'
 * - `editable`: false to stop editing tags in place
 * - `delimiter`: typing it adds a tag too (',')
 * - `validate`: function({ inputValue, value }) returning whether to add it; a
 *   rejected tag stays in the box to fix, and the field flashes red
 * - `allowDuplicates`: let the same tag in twice
 * - `addOnPaste`: split pasted text by the delimiter into tags (on by default)
 * - `name`: for plain form posts (comma-separated)
 *
 * By hand, with Ark's parts:
 *
 *   <TagsInput.Root>
 *     <TagsInput.Label>Topics</TagsInput.Label>
 *     <TagsInput.Control>
 *       <TagsInput.Context>{(api) => api.value.map((tag, index) => (
 *         <TagsInput.Item key={index} index={index} value={tag}>
 *           <TagsInput.ItemPreview><TagsInput.ItemText>{tag}</TagsInput.ItemText><TagsInput.ItemDeleteTrigger>×</TagsInput.ItemDeleteTrigger></TagsInput.ItemPreview>
 *           <TagsInput.ItemInput />
 *         </TagsInput.Item>
 *       ))}</TagsInput.Context>
 *       <TagsInput.Input />
 *     </TagsInput.Control>
 *     <TagsInput.HiddenInput />
 *   </TagsInput.Root>
 */
import { useRef, useState, type ReactNode } from 'react'
import { TagsInput as Ark, useTagsInput, type TagsInputValueChangeDetails } from '@ark-ui/react/tags-input'
import { useFieldContext } from '@ark-ui/react/field'
import '../icons.js'
import { cx, partOf, partsOf, useControllable, withParts, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './tags-input.css'

type Machine = Parameters<typeof useTagsInput>[0]

export type TagsInputProps = Omit<Ark.RootProps, 'value' | 'defaultValue' | 'onValueChange' | 'label'> & {
  label?: ReactNode
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[], details: TagsInputValueChangeDetails) => void
  placeholder?: string
  variant?: 'subtle' | 'accent' | 'outline'
  classes?: Classes<'root' | 'label' | 'control' | 'tags' | 'item' | 'itemPreview' | 'itemText' | 'itemDeleteTrigger' | 'itemInput' | 'input' | 'clearTrigger'>
}

function TagsInputShortcut({
  label = null, value, defaultValue, onValueChange, placeholder: placeholderProp, variant = 'subtle', max = Infinity, delimiter = ',',
  validate, allowDuplicates = false, addOnPaste = true, editable = true, name, disabled, className, classes, ...rest
}: TagsInputProps) {
  const t = useMessages()
  const placeholder = placeholderProp ?? t.tagsInput.placeholder
  const field = useFieldContext()
  const part = partsOf('tags-input', classes)
  const [tags, setTags] = useControllable<string[]>(value, defaultValue ?? [], undefined)
  const input = useRef<HTMLInputElement>(null)
  // What was typed, to put back when `validate` turns it down (Zag clears it).
  const typed = useRef('')
  const [rejected, setRejected] = useState(false)

  const props: Machine = {
    value: tags, max, delimiter, allowDuplicates, addOnPaste, editable, blurBehavior: 'add',
    ...(validate && { validate }), ...(name && { name }), ...(disabled !== undefined && { disabled }),
    ...(t.zag.tagsInput && { translations: t.zag.tagsInput }),
    onInputValueChange: (details) => { if (details.inputValue) typed.current = details.inputValue },
    onValueInvalid: () => {
      const text = typed.current
      // Zag clears the box in the next frame; put the text back after that.
      requestAnimationFrame(() => requestAnimationFrame(() => api.current.setInputValue(text)))
      setRejected(true)
      setTimeout(() => setRejected(false), 700)
    },
    onValueChange: (details) => {
      // Zag clears its own copy of the typed text after adding a tag, but not
      // always the box itself (after a delimiter), so clear that too.
      if (details.value.length > tags.length && input.current) input.current.value = ''
      setTags(details.value)
      onValueChange?.(details.value, details)
    },
  }
  const tagsInput = useTagsInput(props)
  const api = useRef(tagsInput)
  api.current = tagsInput

  return (
    <Ark.RootProvider value={tagsInput} {...rest} {...part('root')} className={cx(className, classes?.root)} data-variant={variant}>
      {label && !field && <Ark.Label {...part('label')}>{label}</Ark.Label>}
      <Ark.Control {...part('control')} data-rejected={rejected || undefined}>
        <div {...part('tags')}>
          {tagsInput.value.map((tag, index) => (
            <Ark.Item key={`${index}:${tag}`} index={index} value={tag} {...part('item')}>
              <Ark.ItemPreview {...part('item-preview')}>
                <Ark.ItemText {...part('item-text')}>{tag}</Ark.ItemText>
                <Ark.ItemDeleteTrigger {...part('item-delete-trigger')}><iconify-icon icon="lucide:x" /></Ark.ItemDeleteTrigger>
              </Ark.ItemPreview>
              <Ark.ItemInput {...part('item-input')} />
            </Ark.Item>
          ))}
          <Ark.Input ref={input} {...part('input')} placeholder={tagsInput.value.length ? '' : placeholder} />
        </div>
        <Ark.ClearTrigger {...part('clear-trigger')}><iconify-icon icon="lucide:x" /></Ark.ClearTrigger>
      </Ark.Control>
      <Ark.HiddenInput />
    </Ark.RootProvider>
  )
}

export const TagsInput = withParts(TagsInputShortcut, {
  Root: Ark.Root,
  RootProvider: Ark.RootProvider,
  Label: Ark.Label,
  Control: Ark.Control,
  Input: Ark.Input,
  Item: Ark.Item,
  ItemPreview: Ark.ItemPreview,
  ItemText: Ark.ItemText,
  ItemDeleteTrigger: Ark.ItemDeleteTrigger,
  ItemInput: Ark.ItemInput,
  ClearTrigger: Ark.ClearTrigger,
  HiddenInput: Ark.HiddenInput,
  Context: Ark.Context,
  Tags: partOf('tags-input', 'tags'),
})
