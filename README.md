# @milktop/react-ui

React components on [Ark UI](https://ark-ui.com) (and so on
[Zag](https://zagjs.com) state machines), with
[imba-ui](https://github.com/milktop/imba-ui)'s and
[svelte-ui](https://github.com/milktop/svelte-ui)'s API, tokens and design.

## One component, or its parts

Every component is a **shortcut**: one element, props in, done.

```jsx
import { Field, Select, Checkbox, Button } from '@milktop/react-ui'

<Field label="Student" error={errors.student}>
  <Select items={students} labelKey="name" valueKey="id" value={student} onValueChange={setStudent} />
</Field>
<Checkbox label="Remind them" checked={remind} onCheckedChange={setRemind} />
<Button variant="primary" loading={saving}>Save</Button>
```

The same component carries its **parts**, for the times the shortcut's
layout isn't what you need. They're Ark's own parts, styled by the same CSS,
so a hand-built component looks just like the shortcut:

```jsx
<Checkbox.Root>
  <Checkbox.Label>Terms</Checkbox.Label>
  <Checkbox.Control><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Control>
  <a href="/terms">read them</a>
  <Checkbox.HiddenInput />
</Checkbox.Root>
```

No CLI and no copied snippets: every shortcut ships in the package, and
where one doesn't fit you build from the parts.

Our own parts hang off their component the same way, so one import covers
them: `Sidebar.Section`, `Sidebar.Item`, `Menu.Item`, `Tabs.Tab`,
`Accordion.Item`. Where one of ours takes a name Ark also uses, Ark's part
moves aside (`Accordion.RawItem`). They're also exported by name
(`NavSection`, `MenuItem`, `Tab`…), for imports by name and, later, server
components; the dotted form is the one the docs use.

## Components

So far:

- Actions: Button · CopyButton
- Display: Avatar · AvatarGroup · Badge · Card (props or composed from Card.Header/Body/Footer) ·
  Table (sorting, selection with Shift ranges, loading, custom cells; `sortRows`) ·
  Pagination · DataList · Stat · Stats · Timeline · TreeView · Editable (edit in place) · Attachments (tiles or a list,
  click-to-enlarge images) · Charts (AreaChart, BarChart, DonutChart, Sparkline; d3 for the maths)
- Text and numbers: FormatNumber · FormatBytes · FormatRelative (and `formatNumber`, `formatBytes`,
  `formatRelative`) · RollingNumber · Divider · Kbd · Prose (rich text as the Editor shows it) · Highlight (search matches)
- Feedback: Alert · Banner · Progress · Skeleton · Spinner · EmptyState
- Inputs: Input · Textarea · Editor (rich text on TipTap, with image uploads) · NumberInput · PasswordInput · PinInput · TagsInput ·
  Slider · FileUpload
- Pickers: TimeInput · NativeSelect · SwatchPicker · Select (one component: searchable, server `load`, `onCreate`,
  multiple, tags; Combobox's parts for building one by hand) · DatePicker
- Choices: Checkbox · CheckboxGroup · Switch · RadioGroup · Segmented ·
  ThemeToggle (`colorScheme`, `useColorScheme`) · Appearance (light and dark, the accent and the
  sidebar style behind one button; `appearance`, `useAppearance`)
- Forms: Field · Fields
- Overlays: Tooltip · Popover · HoverCard · Dialog · Sheet (both: props or
  composed from Header/Body/Footer) · ActionBar · Menu · ContextMenu (Menu.Item,
  Separator, Group, Checkbox, RadioGroup/Radio, Submenu) ·
  Toaster (`toaster.success(…)` from anywhere) · `confirm()` (`await confirm({ … })`
  from anywhere, no state or markup)
- Scheduling and ordering (React only): EventCalendar (day, n days, work week or
  week by the hour, with resources such as vets or rooms as columns; drag to
  select a time, drag or arrow-key events to move and resize them, all-day
  events, a date jump) · SortableList (drag or keyboard, on dnd-kit)
- Disclosure: Tabs (Tabs.Tab, with counts and dots, inline or in the corner) · Accordion · Collapsible
- Navigation: AppShell (flat or inset; the sidebar collapses to a rail with ⌘B
  and is a drawer on phones; inset, or `scroll="page"`, scrolls only the page
  on wide screens) · Topbar · Sidebar (Sidebar.Section, Group, Item, User) · Page · Breadcrumbs · Command (⌘K)

That's all of svelte-ui's components.

The playground runs on the library's own AppShell, Sidebar, Topbar, Page,
Breadcrumbs and Command, with an Appearance panel (accent, font, radius,
density, layout), Theming and Installation guides, and blocks: whole pages
(dashboard, students, profile, inbox, settings, sign-in) and sections.

## Locale

Wrap the app in `<LocaleProvider locale="fr-FR">` and formatting, DatePicker,
EventCalendar, Progress, Slider and the charts follow it (each still takes its
own `locale`). `useLocale()` gives it to your own code.

The components' own words (placeholders, empty states, "Showing 1–10 of 95",
screen-reader labels, Zag's included) follow it too: English and French are
built in, in `src/format/messages.ts`. Change any of them with `messages`,
merged over the built-in list:

    <LocaleProvider locale="fr-FR" messages={{ table: { empty: 'Aucun patient' } }}>

For another language, give a whole list (start from the exported `en`). A
prop given to a component (`placeholder`, `emptyText`, EventCalendar's
`translations`) still wins. `confirm()`, which renders in its own root, uses
the words of the app's provider.

## Every component works the same way

- One package and namespace: `import { Button, Select } from '@milktop/react-ui'`.
- Values: `value` (or `checked`, `open`) to control it, `defaultValue` to
  start it, and `onValueChange` (or `onCheckedChange`, `onOpenChange`) called
  with the new value itself, not Ark's details object.
- `className`: classes for the outer element.
- `classes`: classes per part, keyed by camelCased part name
  (`classes={{ itemText: 'font-mono' }}`).
- Slots replace a part's content: a node, or a function given its state
  (`indicator={({ indeterminate }) => …}`, `renderItem={(item) => …}`).
- Tokens for one instance or a section: a class (`className="[--ui-accent:#16a34a]"` with
  Tailwind) or `style={{ '--ui-accent': … }}`; on `:root` for the whole app.
- Typed: written in TypeScript, shipped as JS with `.d.ts` types, so TSX apps
  get checked props (Select's value is the type of your items' `valueKey`)
  and JSX apps get autocomplete, with no errors either way.
- Other props go to the natural element (the button, the input, Ark's root).

Parts carry Zag's `data-scope` and `data-part` attributes, which the CSS
targets, all in `@layer ui`. So your classes and Tailwind's utilities always
win without `!important`. Part names are Ark's, so they match what you'd
write by hand (a Field's hint is `helper-text`, its error `error-text`).

## Setup

Components import their own CSS. With Tailwind, declare the layer order at
the top of your app's CSS, so its reset stays below the library and its
utilities above:

```css
@layer theme, base, ui, components, utilities;
@import "tailwindcss";
```

Theme it by setting tokens (see `src/theme.css`, shared with svelte-ui);
dark values apply under `html.dark`:

```css
:root { --ui-accent: #e11d48; --ui-radius: 10px; }
```

### Accent and sidebar style

`appearance` holds the accent colour and the sidebar style, saved like
`colorScheme`. `<Appearance>` lets people choose them, with light and dark,
behind one button:

```tsx
<Appearance accents={['teal', 'blue', 'violet']} sidebars={['neutral', 'tint', 'dark']} />
```

`accents` and `sidebars` are what users may choose (every one if left out),
the default first: a saved choice outside them moves to it. While building
the app, add `dev`: it offers every accent and sidebar style, any colour, a
reset, and the props to paste for the current choice. Take it off before
shipping.

The accents are Tailwind's scales (`slate`, `blue`, `indigo`, `violet`,
`teal`, `emerald`, `rose`); a custom hex colour gets its scale worked out in
the browser. It sets the `--ui-accent-50` … `-950` scale on `<html>`, which
the accent and ring tokens are steps of, so setting that scale in your own
CSS recolours them too. The sidebar styles (`default`, `neutral`, `soft`,
`tint`, `accent`, `dark`, `deep`) are light-mode only. From code:

```ts
import { appearance } from '@milktop/react-ui'

appearance.defaults = { accent: 'teal', sidebar: 'neutral' }  // before anything is saved, and for reset
appearance.update({ accent: 'violet', sidebar: 'dark' })
appearance.load(user.appearance)                              // apply a saved one
appearance.onChange = (value) => save(value)                  // { accent, custom, sidebar }
```

It saves under `ui-appearance` (`appearance.storageKey` changes it), scale
included, so the `<head>` can paint it before your bundle loads:

```html
<script>
  try {
    var a = JSON.parse(localStorage.getItem('ui-appearance') || '{}'), r = document.documentElement
    if (a.sidebar && a.sidebar !== 'default') r.dataset.uiSidebarStyle = a.sidebar
    var steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
    if (a.scale) steps.forEach(function (s, i) { r.style.setProperty('--ui-accent-' + s, a.scale[i]) })
    if (a.scaleText) r.style.setProperty('--ui-accent-500-text', a.scaleText)
  } catch (e) {}
</script>
```

### React Server Components

Not supported yet, and not needed in Vite apps. A server component can't
read `Checkbox.Root` off a client component; when that's needed, the parts
will also be exported by name (`CheckboxRoot`…), and the files will get
`'use client'`.

## Develop

```sh
npm install
npm run dev        # the playground, http://localhost:5194
npm run check      # types (tsc) and React's hook rules
npm run build      # the playground as a static site, in playground/dist
npm run build:lib  # the package: src/ to dist/ (JS, .d.ts, CSS); runs before npm publish
```

Releasing (on a clean main): each runs the checks and the build, bumps the
version, commits and tags it, and pushes with the tag. The tag starts the
Publish workflow (`.github/workflows/publish.yml`), which publishes to npm
through Trusted publishing: no npm login or token needed.

```sh
npm run release:patch   # 0.1.0 → 0.1.1
npm run release:minor   # 0.1.0 → 0.2.0
npm run release:major   # 0.1.0 → 1.0.0
npm run release:beta    # 0.1.0 → 0.1.1-beta.0, published under the beta tag
```

Each playground page shows its component's doc comment, and its examples are
the files in `playground/examples/<component>/`, shown with their code. The
playground compiles the TSX source directly, so it never needs `build:lib`.

## Deploy the playground

`npm run build` writes a static, client-side site to `playground/dist`, set
up for **Cloudflare Pages** just like svelte-ui: framework preset None, build
command `npm run build`, output directory `playground/dist`, Node 22 from
`.nvmrc`. The site routes on the URL hash (no SPA fallback needed) and is kept
out of search results by a `noindex` meta tag and `playground/public/_headers`.
