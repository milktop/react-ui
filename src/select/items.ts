import { useControllable } from '../utils.js'

// Items are strings, numbers or objects; Zag's values are strings. These map
// between them, and keep the value (the items' own values) controlled or not.
export function useItems<T>({ labelKey = 'label', valueKey = 'value', disabledKey = 'disabled', multiple = false,
  value, defaultValue, onValueChange }: {
  labelKey?: string, valueKey?: string, disabledKey?: string, multiple?: boolean,
  value?: unknown, defaultValue?: unknown, onValueChange?: (value: unknown) => void
}) {
  const field = (item: T, key: string) => (item as Record<string, unknown>)[key]
  const isObject = (item: T) => typeof item === 'object' && item !== null
  const labelOf = (item: T) => String(isObject(item) ? field(item, labelKey) : item)
  const valueOf = (item: T) => (isObject(item) ? field(item, valueKey) : item)
  const keyOf = (item: T) => String(valueOf(item))
  const isDisabled = (item: T) => isObject(item) && !!field(item, disabledKey)

  const [current, setCurrent] = useControllable<unknown>(value, defaultValue ?? (multiple ? [] : null), onValueChange)
  const keys = multiple ? ((current as unknown[] | null) ?? []).map(String) : current == null ? [] : [String(current)]

  return { labelOf, valueOf, keyOf, isDisabled, current, setCurrent, keys }
}
