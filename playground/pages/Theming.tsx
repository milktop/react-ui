// Theming: each way to restyle, from the whole app to one part, each live
// (the tokens themselves are on the Tokens page).
import { useState, type CSSProperties } from 'react'
import { Button, Badge, Input, Switch, Checkbox, Progress, Segmented, Field, Table, CopyButton, useColorScheme } from '@milktop/react-ui'
import { Demo } from '../lib/Demo'
import { examplesOf } from '../registry'
const fonts = [{ value: 'inherit', label: 'Inherit' }, { value: 'Georgia, serif', label: 'Serif' }, { value: 'ui-monospace, monospace', label: 'Mono' }]
const radii = [{ value: '2px', label: 'Sharp' }, { value: '6px', label: 'Default' }, { value: '12px', label: 'Round' }]
const strokes = [{ value: '1.5', label: 'Light' }, { value: '2', label: 'Default' }, { value: '2.5', label: 'Bold' }]

// Where each way applies, and what it reaches.
const wins = [
  ['The whole app', ':root { --ui-accent: … }', 'Every component, through tokens'],
  ['Part of a page, or one instance', 'className="[--ui-accent:…]" (or style)', 'Everything inside it; overrides :root'],
  ['Every instance', '[data-scope=checkbox][data-part=control] { … }', 'That part wherever it’s used; beats @layer ui'],
  ['One part of one instance', 'classes={{ control: \'…\' }}', 'That part of that instance'],
  ['A part’s content', 'indicator={…}, renderItem={…}', 'What the part shows'],
  ['The layout', '<Checkbox.Root>…</Checkbox.Root>', 'Everything: you place the parts'],
]

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
  const [stroke, setStroke] = useState('2')
  const [agree, setAgree] = useState(true)

  const style = Object.fromEntries(Object.entries({ ...accentTokens(accent, dark), 'ui-radius': radius, 'ui-font': font, 'ui-icon-stroke': stroke })
    .map(([name, value]) => [`--${name}`, value])) as CSSProperties

  const block = (forDark: boolean) => {
    const all = accentTokens(accent, forDark)
    if (!forDark) {
      all['ui-radius'] = radius
      if (font !== 'inherit') all['ui-font'] = font
      if (stroke !== '2') all['ui-icon-stroke'] = stroke
    }
    return Object.entries(all).map(([name, value]) => `  --${name}: ${value};`).join('\n')
  }
  const snippet = `:root {\n${block(false)}\n}\n\n:root.dark {\n${block(true)}\n}`

  return <>
    <h1 className="m-0 text-xl font-bold">Theming</h1>
    <p className="mt-1 mb-0 text-sm text-(--ui-muted)">
      Ways to change how the components look, from the broadest to the narrowest. Start with tokens
      (the <code className={code}>--ui-*</code> variables; <a href="#/tokens" className="text-(--ui-accent)">Tokens</a> lists
      them all): they reach every component at once. Reach for a component's parts only for what tokens don't
      cover. All the library's CSS sits in <code className={code}>@layer ui</code>, so your CSS and Tailwind's utilities beat
      it without <code className={code}>!important</code>. Each component page's Styling panel lists the tokens, variables
      and parts it uses.
    </p>

    <section className="flex flex-col gap-3 py-5">
      <h2 className="m-0 text-base font-semibold">The whole app</h2>
      <p className="m-0 text-sm text-(--ui-muted)">Pick an accent, radius, font and icon weight: the box shows them, and the CSS below sets them for the whole app, with deeper tints for dark mode. Paste it into your app's CSS.</p>
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">Accent
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)}
            className="h-9 w-16 cursor-pointer rounded-(--ui-radius) border border-(--ui-border) bg-(--ui-surface) p-1" /></label>
        <Field label="Radius"><Segmented items={radii} value={radius} onValueChange={(v) => v && setRadius(v)} /></Field>
        <Field label="Font"><Segmented items={fonts} value={font} onValueChange={(v) => v && setFont(v)} /></Field>
        <Field label="Icons"><Segmented items={strokes} value={stroke} onValueChange={(v) => v && setStroke(v)} /></Field>
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
      <h2 className="m-0 text-base font-semibold">Which wins</h2>
      <Table>
        <table>
          <thead><tr><th>Where</th><th>How</th><th>Reaches</th></tr></thead>
          <tbody>
            {wins.map(([where, how, reaches]) => (
              <tr key={where}><td>{where}</td><td className="whitespace-normal"><code className="text-xs">{how}</code></td>
                <td className="whitespace-normal text-(--ui-muted)">{reaches}</td></tr>
            ))}
          </tbody>
        </table>
      </Table>
    </section>
  </>
}
