# @milktop/react-ui

React 19 components, in TypeScript, on Ark UI (Zag underneath), ported from svelte-ui
(`~/sites/svelte/ui`) and imba-ui (`~/sites/imba/ui`): same props, tokens and
look. Read `README.md` first.

## Layout

- `src/<component>/<Name>.tsx` and `<component>.css`, exported from `src/index.ts`.
  Imports inside src use `.js` extensions (`'../utils.js'`), which tsc
  resolves to the .ts files and keeps in dist.
  The CSS and `src/theme.css` come from svelte-ui; keep them in step.
- `src/utils.ts`: `cx`, `partsOf`, `partOf`, `withParts`, `slot`, `on`, `useControllable`;
  types `Classes<'part' | …>` and `Slot<State>`
- `npm run build:lib`: tsc (`tsconfig.build.json`) to dist/, then
  `scripts/after-tsc.js` copies the CSS and `css.d.ts` (and references it from
  `index.d.ts`, so apps that check library types resolve the CSS imports).
  Test a change to the package's shape with `npm pack` into a scratch app.
- `playground/`: Vite app (`npm run dev`, port 5194). Pages are listed in
  `registry.ts`; examples are `playground/examples/<slug>/<n>-<name>.tsx`,
  default-exporting a component, with a leading `/* Title\n  description */`
  comment. Pages in a `form` group lay examples on a two-column grid (a `<p>`
  readout spans both). Pages without examples are left out of the nav. Show
  a by-hand example (`<n>-by-hand.tsx`) on each page with parts.

## Every component

- A shortcut (`function CheckboxShortcut`) exported with its parts:
  `export const Checkbox = withParts(CheckboxShortcut, { Root: Ark.Root, … })`.
  Parts are Ark's own where Ark has them; parts of our own (Dialog's Header,
  Body, Footer) are `partOf(scope, name)`.
- Exports its props type (`CheckboxProps`): Ark's root props (`Ark.RootProps`)
  with ours added, `Omit`ting what we replace (`onCheckedChange`, and `label`,
  which Ark types as a string). `classes` is `Classes<…>` of its part names.
- Starts with a `/** */` doc comment: a summary line, a usage example, one
  bullet per prop (``- `name`: what it does``), then a by-hand example.
- Form controls take `label`, skipped inside a Field (`useFieldContext()`).
  Ark's controls wire themselves to an Ark Field: no ids to pass.
- Props: `className` (outer element), `classes` (per part), `...rest` onto the
  natural element (the button, the input, Ark's root).
- `const part = partsOf('<scope>', classes)` and `{...part('name')}` on every
  part. Ark merges our props over its own, so ours win: a component whose
  scope differs from Ark's (Sheet on dialog) just passes its scope.
- Values: `value`/`checked`/`open`, `default…`, and `on…Change` called with the
  value itself. Use `on('onCheckedChange', handler, (d) => d.checked)` to map
  Ark's details; `useControllable` when we keep the value (Select maps Zag's
  string keys to the items' own values).
- Never pass an Ark/Zag prop as `undefined` to mean "default": Zag reads it
  as a value (`defaultChecked: undefined` beats Zag's `false`). Leave such
  props in `...rest`, or spread them only when set.
- Slots: a node or a function given the part's state, through
  `slot(value, fallback, state)`; list items take `renderItem(item, state)`.
- Modifiers are data attributes (`data-size`, `data-variant`), never classes.
- CSS: `@layer ui`, selectors `[data-scope=x][data-part=y]`, Ark's part names.
- Overlays: Ark's `Portal`, and `lazyMount unmountOnExit` on the root; Ark's
  presence waits for the CSS exit animation.
- Imports its CSS and `../theme.css` itself.

## Checks

- `npm run check`: tsc over src and playground (undefined names, wrong
  props, bad imports), then ESLint for hook rules. Run it after editing a
  component. Examples are typed like app code: give state its full type
  (`useState<number | null>(2)` when a Select can clear it).

## Gotchas

- typescript-eslint supports TypeScript < 6.1, so TypeScript stays on 6.0.
- Input's `type` union lists React's known input types without its
  `string & {}` catch-all, or `type="number"` matches both members and
  `onValueChange`'s argument isn't inferred.
- Change handlers get the plain value, typed for what a user can do:
  Checkbox's is a boolean (a click never leaves it indeterminate).
- Zag's select opens on pointerdown: a script's `.click()` doesn't open it.
- Ark's Checkbox.Indicator shows for checked only; the dash needs a second
  `<Indicator indeterminate>`, and the CSS hides `[hidden]` ones.
- Field `required` makes Ark's hidden inputs required, so the browser
  validates before onSubmit: `noValidate` on forms that show their own errors.
- The in-app browser throttles while its pane is hidden: screenshots can be
  stale. Check state with scripts.
