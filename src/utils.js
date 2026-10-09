import { createElement, forwardRef, useCallback, useState } from 'react'

// Joins the truthy class names (nested arrays too).
export const cx = (...names) => names.flat(Infinity).filter(Boolean).join(' ') || undefined

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
const camel = (name) => name.replace(/-(\w)/g, (_, c) => c.toUpperCase())
export const partsOf = (scope, classes) => (name) => ({
  'data-scope': scope,
  'data-part': name,
  className: cx(classes?.[camel(name)]),
})

// A part of our own (not Ark's), for building a component by hand:
//   Dialog.Footer = partOf('dialog', 'footer')   // <Dialog.Footer>…</Dialog.Footer>
export function partOf(scope, name, tag = 'div') {
  const Part = forwardRef(({ as = tag, ...props }, ref) =>
    createElement(as, { 'data-scope': scope, 'data-part': name, ...props, ref }))
  Part.displayName = `${scope}.${name}`
  return Part
}

// The shortcut component, with its parts on it for building it by hand:
//   export const Checkbox = withParts(CheckboxShortcut, { Root: Ark.Root, … })
//   <Checkbox label="…" />  or  <Checkbox.Root>…</Checkbox.Root>
export const withParts = (Shortcut, parts) => Object.assign(Shortcut, parts)

// A slot prop: a node, or a function given the part's state; the default
// when it's absent.
//   {slot(indicator, <CheckIcon />, { checked })}
export const slot = (value, fallback, ...args) =>
  value == null ? fallback : typeof value === 'function' ? value(...args) : value

// A value that's controlled when `value` is given, and kept here otherwise
// (starting from `defaultValue`). Calls onChange either way.
export function useControllable(value, defaultValue, onChange) {
  const [own, setOwn] = useState(defaultValue)
  const controlled = value !== undefined
  const set = useCallback((next) => {
    if (!controlled) setOwn(next)
    onChange?.(next)
  }, [controlled, onChange])
  return [controlled ? value : own, set]
}

// A change handler given the value rather than Ark's details object, and
// left out when there's none: Zag reads a prop passed as undefined as a
// value, overriding its default.
//   <Ark.Root {...rest} {...on('onCheckedChange', onCheckedChange, (d) => d.checked)}>
export const on = (name, handler, pick) => (handler ? { [name]: (details) => handler(pick(details), details) } : {})
