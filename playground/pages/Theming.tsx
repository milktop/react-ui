// Theming: brand a section live (and copy the CSS for the whole app), the
// ways to restyle one component or part, and every token.
import { useState, type CSSProperties } from 'react'
import { Button, Badge, Input, Switch, Checkbox, Progress, Segmented, Field, Table, CopyButton, useColorScheme } from '@milktop/react-ui'
import { Demo } from '../lib/Demo'
import { examplesOf } from '../registry'
import themeSource from '../../src/theme.css?raw'

type Token = { name: string, light: string, dark: string }

// The tokens and their defaults, read from theme.css: the :root block, then
// the dark block's overrides.
function readTokens() {
  const tokens: Token[] = []
  const byName: Record<string, Token> = {}
  let mode: 'light' | 'dark' | null = null
  for (const line of themeSource.split('\n')) {
    if (/^\s*:root \{/.test(line)) mode = 'light'
    else if (/^\s*:root\.dark/.test(line)) mode = 'dark'
    else if (/^\s*\}/.test(line)) mode = null
    else if (mode) {
      const m = line.match(/^\s*--(ui-[\w-]+):\s*(.+);/)
      if (!m) continue
      byName[m[1]] ??= tokens[tokens.push({ name: m[1], light: '', dark: '' }) - 1]
      byName[m[1]][mode] = m[2].trim()
    }
  }
  return tokens
}
const tokens = readTokens()
const isColour = (token: Token) => !/radius|font|height|width|shadow|padding|weight/.test(token.name)

const fonts = [{ value: 'inherit', label: 'Inherit' }, { value: 'Georgia, serif', label: 'Serif' }, { value: 'ui-monospace, monospace', label: 'Mono' }]
const radii = [{ value: '2px', label: 'Sharp' }, { value: '6px', label: 'Default' }, { value: '12px', label: 'Round' }]

// The accent's companions, mixed from it: a soft tint for selections and
// soft buttons, a deep shade for text on it, and the focus ring.
const accentTokens = (colour: string, dark: boolean): Record<string, string> => ({
  'ui-accent': colour,
  'ui-accent-soft': `color-mix(in srgb, ${colour} ${dark ? 30 : 15}%, ${dark ? 'black' : 'white'})`,
  'ui-accent-soft-text': `color-mix(in srgb, ${colour} ${dark ? 35 : 70}%, ${dark ? 'white' : 'black'})`,
  'ui-ring': colour,
  'ui-ring-soft': `color-mix(in srgb, ${colour} 25%, transparent)`,
})

const code = 'rounded bg-(--ui-hover) px-1 text-xs'
const pre = 'm-0 overflow-x-auto rounded-[calc(var(--ui-radius)+6px)] border border-(--ui-border) bg-(--ui-surface) p-4 text-xs leading-relaxed'

export function Theming() {
  const { dark } = useColorScheme()
  const [accent, setAccent] = useState('#e11d48')
  const [radius, setRadius] = useState('12px')
  const [font, setFont] = useState('inherit')
  const [agree, setAgree] = useState(true)

  const style = Object.fromEntries(Object.entries({ ...accentTokens(accent, dark), 'ui-radius': radius, 'ui-font': font })
    .map(([name, value]) => [`--${name}`, value])) as CSSProperties

  const block = (forDark: boolean) => {
    const all = accentTokens(accent, forDark)
    if (!forDark) {
      all['ui-radius'] = radius
      if (font !== 'inherit') all['ui-font'] = font
    }
    return Object.entries(all).map(([name, value]) => `  --${name}: ${value};`).join('\n')
  }
  const snippet = `:root {\n${block(false)}\n}\n\n:root.dark {\n${block(true)}\n}`

  return <>
    <h1 className="m-0 text-xl font-bold">Theming</h1>
    <p className="mt-1 mb-0 text-sm text-(--ui-muted)">
      Components read <code className={code}>--ui-*</code> tokens. Override them on <code className={code}>:root</code> to
      brand the whole app, or on any element to restyle just what's inside it. All the library's CSS sits
      in <code className={code}>@layer ui</code>, so your CSS and Tailwind's utilities beat it without <code className={code}>!important</code>.
      From the widest to the narrowest:
    </p>
    <ol className="mt-3 mb-0 flex flex-col gap-1 pl-5 text-sm text-(--ui-muted)">
      <li><strong className="text-(--ui-text)">The whole app</strong>: tokens on <code className={code}>:root</code> (below), or the Appearance panel in the top bar.</li>
      <li><strong className="text-(--ui-text)">Every instance of a component</strong>: CSS on its <code className={code}>[data-scope][data-part]</code> attributes.</li>
      <li><strong className="text-(--ui-text)">A section or one instance</strong>: tokens in <code className={code}>style</code>.</li>
      <li><strong className="text-(--ui-text)">One part of one instance</strong>: <code className={code}>className</code> and <code className={code}>classes</code>.</li>
      <li><strong className="text-(--ui-text)">A part's content</strong>: slots and render functions; <strong className="text-(--ui-text)">the layout</strong>: build it from its parts.</li>
    </ol>

    <section className="flex flex-col gap-3 py-5">
      <h2 className="m-0 text-base font-semibold">The whole app</h2>
      <p className="m-0 text-sm text-(--ui-muted)">Pick an accent, radius and font: the box shows them, and the CSS below sets them for the whole app, with deeper tints for dark mode. Paste it into your app's CSS.</p>
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">Accent
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)}
            className="h-9 w-16 cursor-pointer rounded-(--ui-radius) border border-(--ui-border) bg-(--ui-surface) p-1" /></label>
        <Field label="Radius"><Segmented items={radii} value={radius} onValueChange={(v) => v && setRadius(v)} /></Field>
        <Field label="Font"><Segmented items={fonts} value={font} onValueChange={(v) => v && setFont(v)} /></Field>
      </div>
      {/* The overrides apply to this box only. */}
      <div style={style} className="flex w-full flex-col gap-4 rounded-[calc(var(--ui-radius)+4px)] border border-dashed border-(--ui-border) p-5 font-(family-name:--ui-font)">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" icon="lucide:calendar-plus">Book a lesson</Button>
          <Button variant="soft">Soft</Button>
          <Button icon="lucide:bell" aria-label="Notifications" count={3} countColor="accent" />
          <Badge variant="accent">New</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Input icon="lucide:search" placeholder="Search students" className="w-64" />
          <Switch label="Reminders" checked={agree} onCheckedChange={setAgree} />
          <Checkbox label="Agree" checked={agree} onCheckedChange={setAgree} />
        </div>
        <Progress value={64} label="Monthly goal" showValue />
      </div>
      <div className="relative">
        <pre className={pre}><code>{snippet}</code></pre>
        <CopyButton value={snippet} className="absolute top-2 right-2" />
      </div>
    </section>

    {examplesOf('theming').map((example) => <Demo key={example.path} example={example} />)}

    <section className="flex flex-col gap-3 py-5">
      <h2 className="m-0 text-base font-semibold">Tokens</h2>
      <Table>
        <table>
          <thead><tr><th>Token</th><th>Light</th><th>Dark</th></tr></thead>
          <tbody>
            {tokens.map((token) => (
              <tr key={token.name}>
                <td>
                  {isColour(token) && <span className="mr-2 inline-block h-5 w-5 rounded border border-(--ui-border) align-middle" style={{ background: `var(--${token.name})` }} />}
                  <code className="text-xs">--{token.name}</code>
                </td>
                <td className="text-xs break-words whitespace-normal text-(--ui-muted)"><code>{token.light}</code></td>
                <td className="text-xs break-words whitespace-normal text-(--ui-muted)"><code>{token.dark || 'same'}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Table>
    </section>
  </>
}
