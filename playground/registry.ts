// The playground's pages, each naming the component file whose doc comment
// it shows; its examples are whatever is in examples/<slug>/ (sorted by file
// name), so nothing here needs updating when a component or example changes.

import type { ComponentType } from 'react'

const sources = import.meta.glob<string>('../src/**/*.tsx', { query: '?raw', import: 'default', eager: true })
const modules = import.meta.glob<{ default: ComponentType }>('./examples/**/*.tsx', { eager: true })
const raws = import.meta.glob<string>('./examples/**/*.tsx', { query: '?raw', import: 'default', eager: true })

export type Page = { slug: string, title: string, about: string, file: string, form?: boolean }
export type Group = { heading: string, icon: string, form?: boolean, pages: Page[] }
export type Example = ReturnType<typeof examplesOf>[number]

// Pages without examples yet are left out of the nav.
const all: Group[] = [
  { heading: 'Actions', icon: 'lucide:mouse-pointer-click', pages: [
    { slug: 'button', title: 'Button', about: 'Variants, sizes, icons, loading and counts', file: 'button/Button.tsx' },
  ] },
  { heading: 'Inputs', form: true, icon: 'lucide:text-cursor-input', pages: [
    { slug: 'input', title: 'Input', about: 'Text and numbers, with icons and affixes', file: 'input/Input.tsx' },
  ] },
  { heading: 'Pickers', form: true, icon: 'lucide:list-checks', pages: [
    { slug: 'select', title: 'Select', about: 'Pick one or several', file: 'select/Select.tsx' },
  ] },
  { heading: 'Choices', form: true, icon: 'lucide:circle-check', pages: [
    { slug: 'checkbox', title: 'Checkbox', about: 'On or off, or in between', file: 'checkbox/Checkbox.tsx' },
    { slug: 'switch', title: 'Switch', about: 'On or off', file: 'switch/Switch.tsx' },
  ] },
  { heading: 'Forms', icon: 'lucide:clipboard-list', pages: [
    { slug: 'field', title: 'Field', about: 'Labels, hints and errors, on a grid', file: 'field/Field.tsx' },
  ] },
  { heading: 'Overlays', icon: 'lucide:layers', pages: [
    { slug: 'dialog', title: 'Dialog', about: 'Modals and confirmations', file: 'dialog/Dialog.tsx' },
  ] },
]

const hasExamples = (slug: string) => Object.keys(modules).some((path) => path.startsWith(`./examples/${slug}/`))
export const groups = all
  .map((group) => ({ ...group, pages: group.pages.filter((page) => hasExamples(page.slug)) }))
  .filter((group) => group.pages.length)

export const pages = groups.flatMap((group) => group.pages.map((page) => ({ ...page, group })))

// A component's doc comment (the first /** … */ block), without its stars.
export function docOf(file: string) {
  const block = (sources[`../src/${file}`] ?? '').match(/\/\*\*([\s\S]*?)\*\//)?.[1] ?? ''
  const lines = block.split('\n').map((line) => line.replace(/^\s*\* ?/, '')).join('\n').trim()
  return { summary: lines.split('\n\n')[0].replace(/\n/g, ' '), text: lines }
}

// An example's title and description come from its leading comment:
// /* Title
//    What it shows. */
export function examplesOf(slug: string) {
  return Object.keys(modules)
    .filter((path) => path.startsWith(`./examples/${slug}/`))
    .sort()
    .map((path) => {
      const raw = raws[path]
      const comment = raw.match(/^\/\*\s*([\s\S]*?)\s*\*\/\n?/)
      const [title, ...rest] = (comment?.[1] ?? '').split('\n')
      return {
        path,
        // `<n>-<name>.bare.tsx`: no card round it (it brings its own surface).
        bare: path.endsWith('.bare.tsx'),
        Component: modules[path].default,
        title,
        description: rest.map((line) => line.trim()).join(' '),
        code: (comment ? raw.slice(comment[0].length) : raw).trim(),
      }
    })
}
