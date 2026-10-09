import { createElement, useCallback, useState } from 'react'
import type { ComponentProps, ElementType, ReactNode } from 'react'

type ClassName = string | false | null | undefined | ClassName[]

// Joins the truthy class names (nested arrays too).
export const cx = (...names: ClassName[]): string | undefined =>
  names.map((name) => (Array.isArray(name) ? cx(...name) : name)).filter(Boolean).join(' ') || undefined

// Classes for a component's parts, keyed by camelCased part name.
export type Classes<Part extends string> = Partial<Record<Part, string>>

// A component's parts carry Zag-style data-scope and data-part attributes,
// which the library's CSS targets, so a part never matches another
// component's rules, and the library adds no classes of its own to collide
// with yours or Tailwind's. Each part also gets the caller's classes for it,
// from the `classes` prop, keyed by camelCased part name:
//
//   const part = partsOf('select', classes)
//   <Ark.Trigger {...part('trigger')}>   // classes={{ trigger: '…' }}
//
// Ark merges our props over its own, so on an Ark part these win: that's
// how Sheet's parts say data-scope="sheet" on Ark's dialog. Where the scopes
// match they're the same values Ark sets anyway.
const camel = (name: string) => name.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())
export const partsOf = (scope: string, classes?: Partial<Record<string, string>>) => (name: string) => ({
  'data-scope': scope,
  'data-part': name,
  className: cx(classes?.[camel(name)]),
})

// A part of our own (not Ark's), for building a component by hand; it takes
// the props of its element (a div by default):
//   Dialog.Footer = partOf('dialog', 'footer')   // <Dialog.Footer>…</Dialog.Footer>
export function partOf<T extends ElementType = 'div'>(scope: string, name: string, tag: T = 'div' as T) {
  const Part = (props: ComponentProps<T>) => createElement(tag, { 'data-scope': scope, 'data-part': name, ...props })
  Part.displayName = `${scope}.${name}`
  return Part
}

// The shortcut component, with its parts on it for building it by hand:
//   export const Checkbox = withParts(CheckboxShortcut, { Root: Ark.Root, … })
//   <Checkbox label="…" />  or  <Checkbox.Root>…</Checkbox.Root>
export const withParts = <S extends object, P extends object>(Shortcut: S, parts: P): S & P =>
  Object.assign(Shortcut, parts)

// A slot prop: a node, or a function given the part's state.
export type Slot<State> = ReactNode | ((state: State) => ReactNode)

// A slot's content: the default when it's absent.
//   {slot(indicator, <CheckIcon />, { indeterminate })}
export function slot<State>(value: Slot<State> | undefined, fallback: ReactNode, state: State): ReactNode {
  if (value == null) return fallback
  return typeof value === 'function' ? value(state) : value
}

// A value that's controlled when `value` is given, and kept here otherwise
// (starting from `defaultValue`). Calls onChange either way.
export function useControllable<V>(value: V | undefined, defaultValue: V, onChange?: (value: V) => void) {
  const [own, setOwn] = useState(defaultValue)
  const controlled = value !== undefined
  const set = useCallback((next: V) => {
    if (!controlled) setOwn(next)
    onChange?.(next)
  }, [controlled, onChange])
  return [controlled ? value : own, set] as const
}

// A change handler given the value rather than Ark's details object, and
// left out when there's none: Zag reads a prop passed as undefined as a
// value, overriding its default.
//   <Ark.Root {...rest} {...on('onCheckedChange', onCheckedChange, (d) => d.checked)}>
export function on<Name extends string, Details, Value>(
  name: Name,
  handler: ((value: Value, details: Details) => void) | undefined,
  pick: (details: Details) => Value,
): Partial<Record<Name, (details: Details) => void>> {
  return handler ? { [name]: (details: Details) => handler(pick(details), details) } as Record<Name, (details: Details) => void> : {}
}
