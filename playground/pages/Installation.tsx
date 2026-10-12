// Installation: install, set up the CSS layers, import and use, style, TypeScript.
import { Badge } from '@milktop/react-ui'
import pkg from '../../package.json'

const version = `v${pkg.version}`

const install = `npm install @milktop/react-ui
# or, while developing the library (after npm run build:lib there)
npm install file:../../react/ui`

const css = `/* app.css: the library's layer sits below Tailwind's utilities */
@layer theme, base, ui, components, utilities;
@import "tailwindcss";`

const usage = `import { useState } from 'react'
import { DatePicker, Select } from '@milktop/react-ui'

function Lesson() {
  const [date, setDate] = useState<string | null>(null)
  const [subject, setSubject] = useState<number | null>(null)
  return <>
    <DatePicker label="Lesson date" value={date} onValueChange={setDate} />
    <Select label="Subject" items={subjects} labelKey="name" valueKey="id" searchable
      value={subject} onValueChange={setSubject} />
  </>
}`

const parts = `// The shortcut: one component, props in
<Checkbox label="Remind them" checked={remind} onCheckedChange={setRemind} />

// Its parts, when you need your own layout (Ark's, styled by the same CSS)
<Checkbox.Root checked={remind} onCheckedChange={(d) => setRemind(d.checked === true)}>
  <Checkbox.Control><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Control>
  <Checkbox.Label>Remind them</Checkbox.Label>
  <Checkbox.HiddenInput />
</Checkbox.Root>`

const style = `// the outer element: className; a part: classes; tokens: style; a part's content: a slot
<DatePicker
  className="w-64"
  classes={{ trigger: 'rounded-full' }}
  style={{ '--ui-accent': 'var(--brand)' } as React.CSSProperties}
/>`

const sections = [
  { heading: 'Install', text: 'The package ships JavaScript with type declarations and its CSS. Ark UI (with Zag), TipTap, d3 and iconify-icon come with it; React 19 is a peer dependency.', code: install },
  { heading: 'Set up the CSS layers', text: "All the library's CSS sits in @layer ui. With Tailwind, declare the order first, so its reset stays below the library and its utilities above it. Each component imports its own CSS, so there's nothing else to import.", code: css },
  { heading: 'Import and use', text: "One namespace: import what you use. Values are plain: value and onValueChange (or checked, open), called with the new value itself, so useState's setter fits straight in. Dates are ISO strings; Select gives back the items' own values.", code: usage },
  { heading: 'The shortcut or its parts', text: 'Every component is a shortcut that covers the common case, with its parts on it for the rare one. No CLI, no copied snippets.', code: parts },
  { heading: 'Style', text: 'Every component takes className (its outer element) and classes (its parts, by camelCased part name), and the --ui-* tokens restyle it. See Theming for each way, from the whole app to one part.', code: style },
  { heading: 'TypeScript, or not', text: 'Written in TypeScript: TSX apps get checked props (a Select\'s value is the type of its items\' valueKey) and JSX apps get the same autocomplete, with no build step for either.' },
  { heading: 'Upgrade', text: 'npm update @milktop/react-ui, or npm install @milktop/react-ui@latest across a minor version. Until 1.0, a minor version may change props or markup; patch versions only fix things.' },
]

export function Installation() {
  return <>
    <h1 className="m-0 text-xl font-bold">Installation</h1>
    <p className="mt-1 mb-0 text-sm text-(--ui-muted)">Add the package to a React 19 app built with Vite, import the components, and use them.</p>
    <div className="mt-3 flex flex-wrap gap-2"><Badge variant="outline">{version}</Badge><Badge variant="outline">React 19</Badge><Badge variant="outline">Ark UI 5</Badge></div>
    {sections.map((section) => (
      <section key={section.heading} className="flex flex-col gap-3 py-5">
        <h2 className="m-0 text-base font-semibold">{section.heading}</h2>
        <p className="m-0 text-sm leading-relaxed">{section.text}</p>
        {section.code && (
          <pre className="m-0 overflow-x-auto rounded-[calc(var(--ui-radius)+6px)] border border-(--ui-border) bg-(--ui-surface) p-4 text-xs leading-relaxed"><code>{section.code}</code></pre>
        )}
      </section>
    ))}
  </>
}
