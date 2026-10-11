// A component's API, read from its source: the doc comment (summary, usage
// and `- \`prop\`: …` notes), its props with their defaults (the shortcut's
// destructured parameters), its parts (the part('…') calls, keys for
// `classes`), and the parts on it for building it by hand (withParts).
import { sourceOf } from '../registry'

export type Api = {
  tag: string
  summary: string
  usage: string
  props: { name: string, default: string, note: string }[]
  parts: string[]
  byHand: string[]
}

// Notes every component shares.
const common: Record<string, string> = {
  className: 'Classes for the outer element',
  classes: 'Classes per part, by camelCased part name: `{ trigger: "…" }`',
  style: 'Styles for the outer element, e.g. `--ui-*` tokens for this instance',
  children: 'The content',
  ref: 'A ref to the element',
  label: 'A label above it (skipped inside a Field, which has its own)',
  placeholder: 'Shown while it’s empty',
  disabled: 'Can’t be used (a disabled Field sets it)',
  invalid: 'Shown as invalid (a Field with an error sets it)',
  required: 'Must be filled in (a required Field sets it)',
  open: 'Whether it’s open, when you control it',
  defaultOpen: 'Whether it starts open',
  onOpenChange: 'Called with the new open state',
  checked: 'Whether it’s on, when you control it',
  defaultChecked: 'Whether it starts on',
  onChange: 'The element’s own change event (`onValueChange` gives the value itself)',
  min: 'The lowest value', max: 'The highest value', step: 'How far each step goes',
  heading: 'The title', description: 'A line under the title',
}

const unique = (list: string[]) => [...new Set(list)]
const camel = (name: string) => name.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())

export function apiOf(file: string): Api {
  const source = sourceOf(file)
  const dir = file.split('/').slice(0, -1).join('/')
  // A component made of internal ones (Select: ListSelect and SearchSelect) lists their parts too.
  const internal = Array.from(source.matchAll(/from '\.\/(\w+)\.js'/g), (m) => sourceOf(`${dir}/${m[1]}.tsx`))
  const all = [source, ...internal].join('\n')

  const doc = (source.match(/\/\*\*([\s\S]*?)\*\//)?.[1] ?? '').split('\n').map((line) => line.replace(/^\s*\* ?/, '').trimEnd())
  while (doc[0] === '') doc.shift()
  while (doc[doc.length - 1] === '') doc.pop()
  const blank = doc.indexOf('')
  // Notes from every doc comment in the file (Tabs' Tab, Accordion's Item…).
  const { leading, mentioned } = notesOf(Array.from(source.matchAll(/\/\*\*([\s\S]*?)\*\//g), (m) => m[1]).join('\n')
    .split('\n').map((line) => line.replace(/^\s*\* ?/, '').trimEnd()))

  // The shortcut's parameters: `function XShortcut({ a = 1, b, ...rest }: Props)` (or the exported function).
  const params = (source.match(/function \w+Shortcut(?:<[^(]*>)?\(\{([\s\S]*?)\}\s*:\s*\w+/)
    ?? source.match(/export function \w+(?:<[^(]*>)?\(\{([\s\S]*?)\}\s*:\s*\w+/)
    ?? source.match(/function \w+(?:<[^(]*>)?\(\{([\s\S]*?)\}\s*:\s*\w+/))?.[1] ?? ''
  const destructured = splitTopLevel(params)
    .filter((entry) => entry && !entry.startsWith('...'))
    .map((entry) => {
      const [, name, value] = entry.match(/^(\w+)(?:\s*:\s*\w+)?(?:\s*=\s*([\s\S]+))?$/) ?? []
      return { name, default: value?.trim() ?? '' }
    })
    .filter((prop) => prop.name)
  // Documented props it passes straight on (to Ark), not destructured.
  const passed = Object.keys(leading).filter((name) => !destructured.some((prop) => prop.name === name))
  const props = [...destructured, ...passed.map((name) => ({ name, default: '' }))]
    .map((prop) => ({ ...prop, note: leading[prop.name] ?? mentioned[prop.name] ?? common[prop.name] ?? '' }))
    // Common ones last.
    .sort((a, b) => Number(a.name in common) - Number(b.name in common))

  const tag = file.split('/').pop()!.replace('.tsx', '')
  const byHand = Array.from(source.matchAll(/withParts\(\w+,\s*\{([\s\S]*?)\}\)/g)).flatMap((m) =>
    Array.from(m[1].matchAll(/(?:^|,|\{)\s*(\w+)(?=\s*[:,}]|\s*$)/g), (n) => `${tag}.${n[1]}`))

  return {
    tag,
    summary: doc.slice(0, blank === -1 ? doc.length : blank).join(' ').trim(),
    usage: usageOf(doc),
    props,
    parts: unique(Array.from(all.matchAll(/part\('([\w-]+)'\)/g), (m) => camel(m[1]))).filter((name) => name !== 'root'),
    byHand: unique(byHand),
  }
}

// Splits "a = 1, b = { c: 2, d: 3 }, e" at the commas outside brackets and strings.
function splitTopLevel(text: string) {
  const out: string[] = []
  let depth = 0
  let quote: string | null = null
  let current = ''
  for (const char of text) {
    if (quote) { if (char === quote) quote = null }
    else if ('\'"`'.includes(char)) quote = char
    else if ('([{<'.includes(char)) depth++
    else if (')]}>'.includes(char)) depth--
    else if (char === ',' && depth === 0) { out.push(current.trim()); current = ''; continue }
    current += char
  }
  out.push(current.trim())
  return out
}

// Usage examples: indented blocks of code after a blank line (or a line ending in ':').
function usageOf(doc: string[]) {
  const blocks: string[][] = []
  let block: string[] | null = null
  doc.forEach((line, i) => {
    const code = /^\s{2,}\S/.test(line) && !/^\s*-/.test(line)
    if (code && (block || doc[i - 1] === '')) {
      block ??= blocks[blocks.push([]) - 1]
      block.push(line.replace(/^ {2}/, ''))
    } else block = null
  })
  return blocks.map((lines) => lines.join('\n')).join('\n\n')
}

// "- `a`, `b`: text" (continued on indented lines) describes a and b
// (`leading`); a bullet also describes the props it mentions later on, as in
// "- `a`: …; `b`: …" (`mentioned`, used when no bullet leads with them).
function notesOf(doc: string[]) {
  const leading: Record<string, string> = {}
  const mentioned: Record<string, string> = {}
  const bullets: { names: string[], text: string }[] = []
  let current: { names: string[], text: string } | null = null
  for (const line of doc) {
    const m = line.match(/^- ((?:`[\w-]+(?:\([^`]*\))?`[\s,/;]*(?:or |and )?)+)(.*)$/)
    if (m) bullets.push(current = { names: Array.from(m[1].matchAll(/`([\w-]+)/g), (n) => n[1]), text: m[2].replace(/^:\s*/, '') })
    else if (/^- /.test(line)) bullets.push(current = { names: [], text: line.slice(2) })
    else if (current && /^\s{2,}\S/.test(line)) current.text += ' ' + line.trim()
    else current = null
  }
  for (const bullet of bullets) {
    const full = bullet.names.length ? `${bullet.text}` : bullet.text
    // A bullet that only names them ("- `label`, `icon`") says nothing about them.
    if (full.trim()) for (const name of bullet.names) leading[name] ??= full
    for (const m of bullet.text.matchAll(/`([a-zA-Z][\w]*)(?:\(|`)/g)) mentioned[m[1]] ??= `${bullet.names.map((n) => `\`${n}\``).join(', ')}${bullet.names.length ? ': ' : ''}${bullet.text}`
  }
  return { leading, mentioned }
}
