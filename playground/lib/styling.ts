// How to style a component, read from its files like the Props panel (see
// api.ts): the theme tokens its CSS uses, variables of its own, its parts with
// the states they're styled by (and which are Ark's), and starter code with
// its real names.
import { sourceOf } from '../registry'
import { apiOf } from './api'
import { themeTokens } from './tokens'

const styles = import.meta.glob<string>('../../src/**/*.css', { query: '?raw', import: 'default', eager: true })

export type Part = { name: string, key: string, selector: string, states: string[], ark: boolean }
export type Styling = {
  tag: string
  tokens: string[]
  own: string[]
  parts: Part[]
  snippets: { title: string, code: string }[]
}

const unique = (list: string[]) => [...new Set(list)]
const camel = (name: string) => name.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())

// The block after `{` at `from`, up to its matching `}`.
function blockAt(css: string, from: number) {
  let depth = 0
  for (let i = from; i < css.length; i++) {
    if (css[i] === '{') depth++
    else if (css[i] === '}' && --depth === 0) return css.slice(from + 1, i)
  }
  return ''
}

// The states a part's rules are keyed on: modifiers right after its selector
// (`[data-part=item][data-highlighted]`, `:hover`) and the block's own nested
// `&…` rules.
// (Not other parts or scopes named inside, as in `& [data-part=icon]`.)
const stateTokens = (selector: string) => Array.from(selector.matchAll(/\[(?:data|aria)-[^\]]+\]|:(?!is\b|not\b|where\b|has\b)[\w-]+/g), (m) => m[0])
  .filter((state) => !/^\[data-(part|scope)=/.test(state))
function statesOf(css: string, scope: string, part: string) {
  const states: string[] = []
  const head = `[data-scope=${scope}][data-part=${part}]`
  for (let at = css.indexOf(head); at >= 0; at = css.indexOf(head, at + 1)) {
    const rest = css.slice(at + head.length)
    const end = rest.search(/[{,]/)
    if (end < 0) continue
    states.push(...stateTokens(rest.slice(0, end)))
    if (rest[end] !== '{') continue
    // One level in: `&[data-state=checked] {`, `&:hover, &:focus {`.
    let depth = 0
    let line = ''
    for (const char of blockAt(rest, end)) {
      if (char === '{') {
        if (depth === 0 && line.trim().startsWith('&')) states.push(...stateTokens(line.replace(/\/\*[\s\S]*?\*\//g, '')))
        depth++
        line = ''
      } else if (char === '}') { depth--; line = '' }
      else if (char === ';' && depth === 0) line = ''
      else line += char
    }
  }
  return unique(states)
}

export function stylingOf(file: string): Styling {
  const source = sourceOf(file)
  const dir = file.split('/').slice(0, -1).join('/')
  const internal = Array.from(source.matchAll(/from '\.\/(\w+)\.js'/g), (m) => sourceOf(`${dir}/${m[1]}.tsx`))
  const all = [source, ...internal].join('\n')
  const css = unique(Array.from(all.matchAll(/import '\.\/([\w-]+\.css)'/g), (m) => m[1]))
    .map((name) => styles[`../../src/${dir}/${name}`] ?? '').join('\n')
  const api = apiOf(file)

  const scopes = unique(Array.from(all.matchAll(/partsOf\('([\w-]+)'/g), (m) => m[1]))
  const partNames = unique(Array.from(all.matchAll(/part\('([\w-]+)'\)/g), (m) => m[1]))
  // Parts on Ark's own elements carry Zag's state attributes.
  const arkParts = new Set(Array.from(all.matchAll(/<Ark\.\w+[^>]*?\{\.\.\.part\('([\w-]+)'\)/g), (m) => m[1]))
  const parts = partNames.map((name) => {
    // The scope whose CSS styles it (the first, if none does).
    const scope = scopes.find((s) => css.includes(`[data-scope=${s}][data-part=${name}]`)) ?? scopes[0] ?? ''
    return { name, key: camel(name), selector: `[data-scope=${scope}][data-part=${name}]`, states: statesOf(css, scope, name), ark: arkParts.has(name) }
  })

  const names = unique(Array.from(`${css}\n${all}`.matchAll(/--(ui-[\w-]+)/g), (m) => m[1]))
  // Variables of its own: ones its doc comments name (the rest are internal).
  const docs = Array.from(all.matchAll(/\/\*\*[\s\S]*?\*\//g), (m) => m[0]).join('\n')

  // Starter code: a part other than the outer one, where it has one.
  const first = parts.find((p) => p.name !== 'root') ?? parts[0]
  const snippets = first ? [
    { title: 'One instance', code: `<${api.tag} classes={{ ${first.key}: 'text-(--ui-accent)' }} />` },
    { title: 'Every instance', code: `/* In your app's CSS: outside @layer ui, so it wins */\n${first.selector} {\n  color: var(--ui-accent);\n}` },
    ...(api.byHand.length ? [{
      title: 'By hand (its parts)',
      code: `import { ${api.tag} } from '@milktop/react-ui'\n\n// Arrange and class them yourself; the same CSS styles them:\n// ${api.byHand.join(', ')}`,
    }] : []),
  ] : []

  return {
    tag: api.tag,
    // In the theme's order.
    tokens: [...themeTokens].filter((name) => names.includes(name)),
    own: names.filter((name) => !themeTokens.has(name) && docs.includes(`--${name}`)),
    parts,
    snippets,
  }
}
