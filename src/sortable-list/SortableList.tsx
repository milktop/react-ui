/**
 * A list people put in order by dragging (or with the keyboard), on dnd-kit.
 *
 *   <SortableList items={topics} onItemsChange={setTopics} renderItem={(topic) => topic.title} />
 *
 * Drag a row by its grip; or focus the grip, press Space to pick it up, the
 * arrow keys to move it, Space to drop it (Escape puts it back). Screen
 * readers hear each step.
 *
 * - `items`, `defaultItems`; `onItemsChange`: called with the reordered list
 * - `itemKey`: the property that identifies an item ('id'), or a function;
 *   strings and numbers are their own key
 * - `renderItem(item, { index, dragging })`: a row's content
 * - `handle`: drag by the grip only (default), or false for the whole row
 *   (keyboard users still use the row, focused)
 * - `variant`: 'card' (default; rows in a bordered box) or 'plain' (separate,
 *   spaced rows)
 * - `itemLabel(item)`: what screen readers call an item as it moves
 *   ("Picked up Worksheet 4. … moved to position 3 of 5"); by default a
 *   string item itself, or its `label`, `title` or `name`
 * - `disabled`: no reordering; `label`: the list's accessible name
 */
import { useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type Announcements, type DragEndEvent, type Modifier,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import '../icons.js'
import { cx, partsOf, useControllable, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './sortable-list.css'

type Key = string | number
type Part = ReturnType<typeof partsOf>

export type SortableListProps<T> = Omit<HTMLAttributes<HTMLUListElement>, 'children'> & {
  items?: T[]
  defaultItems?: T[]
  onItemsChange?: (items: T[]) => void
  itemKey?: string | ((item: T) => Key)
  renderItem?: (item: T, state: { index: number, dragging: boolean }) => ReactNode
  itemLabel?: (item: T) => string
  handle?: boolean
  variant?: 'card' | 'plain'
  disabled?: boolean
  label?: string
  classes?: Classes<'root' | 'item' | 'handle' | 'content'>
}

// Rows only move up and down.
const vertical: Modifier = ({ transform }) => ({ ...transform, x: 0 })

export function SortableList<T>({
  items: itemsProp, defaultItems = [], onItemsChange, itemKey = 'id', renderItem, itemLabel, handle = true, variant = 'card',
  disabled = false, label, className, classes, ...rest
}: SortableListProps<T>) {
  const t = useMessages()
  const part = partsOf('sortable-list', classes)
  const [items, setItems] = useControllable(itemsProp, defaultItems, onItemsChange)
  const keyOf = (item: T): Key => typeof itemKey === 'function' ? itemKey(item)
    : typeof item === 'string' || typeof item === 'number' ? item : (item as Record<string, Key>)[itemKey]
  const keys = items.map(keyOf)

  // Spoken as an item moves: its name and place, not dnd-kit's ids.
  const nameOf = (id: Key) => {
    const item = items[keys.indexOf(id)]
    if (itemLabel) return itemLabel(item)
    if (typeof item === 'string' || typeof item === 'number') return String(item)
    const fields = item as Record<string, unknown>
    return String(fields.label ?? fields.title ?? fields.name ?? id)
  }
  const moved = useRef(false)
  const place = (id: Key | undefined) => t.sortableList.position(keys.indexOf(id as Key) + 1, keys.length)
  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      moved.current = false
      return t.sortableList.pickedUp(nameOf(active.id), place(active.id))
    },
    // dnd-kit reports the item over its own place as it's picked up: not a move yet.
    onDragOver: ({ active, over }) => {
      if (!over || (over.id === active.id && !moved.current)) return undefined
      moved.current = true
      return t.sortableList.movedTo(nameOf(active.id), place(over.id))
    },
    onDragEnd: ({ active, over }) => t.sortableList.dropped(nameOf(active.id), over ? place(over.id) : null),
    onDragCancel: ({ active }) => t.sortableList.cancelled(nameOf(active.id), place(active.id)),
  }
  const screenReaderInstructions = { draggable: t.sortableList.instructions }

  // A small move before a drag starts, so clicks on the row still work.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function dragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setItems(arrayMove(items, keys.indexOf(active.id), keys.indexOf(over.id)))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[vertical]} onDragEnd={dragEnd}
      accessibility={{ announcements, screenReaderInstructions }}>
      <SortableContext items={keys} strategy={verticalListSortingStrategy} disabled={disabled}>
        <ul {...rest} {...part('root')} className={cx(className, classes?.root)} data-variant={variant} aria-label={label}>
          {items.map((item, index) => (
            <Row key={keys[index]} id={keys[index]} part={part} handle={handle} disabled={disabled}>
              {(dragging) => renderItem ? renderItem(item, { index, dragging }) : String(item)}
            </Row>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function Row({ id, part, handle, disabled, children }: {
  id: Key, part: Part, handle: boolean, disabled: boolean, children: (dragging: boolean) => ReactNode
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled })
  const style: CSSProperties = { transform: CSS.Translate.toString(transform), transition }
  const drag = { ...attributes, ...listeners }
  const t = useMessages()

  return (
    <li ref={setNodeRef} {...part('item')} style={style} data-dragging={isDragging || undefined} data-disabled={disabled || undefined}
      {...(!handle && drag)}>
      {handle && !disabled && (
        <button ref={setActivatorNodeRef} {...part('handle')} type="button" aria-label={t.sortableList.handle} {...drag}>
          <iconify-icon icon="lucide:grip-vertical" aria-hidden="true" />
        </button>
      )}
      <div {...part('content')}>{children(isDragging)}</div>
    </li>
  )
}
