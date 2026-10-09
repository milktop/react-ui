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

## Components

So far: Button · Input · Field/Fields · Checkbox · Switch · Select · Dialog.
The rest of svelte-ui's set follows the same pattern.

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
- `style={{ '--ui-accent': … }}`: tokens for one instance; on `:root` for the whole app.
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

### React Server Components

Not supported yet, and not needed in Vite apps. A server component can't
read `Checkbox.Root` off a client component; when that's needed, the parts
will also be exported by name (`CheckboxRoot`…), and the files will get
`'use client'`.

## Develop

```sh
npm install
npm run dev     # the playground, http://localhost:5194
npm run check   # undefined names and hook rules, which the build lets through
npm run build   # the playground as a static site, in playground/dist
```

Each playground page shows its component's doc comment, and its examples are
the files in `playground/examples/<component>/`, shown with their code.
