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
  Guides are `playground/pages/`; blocks are `playground/blocks/pages/<n>-<slug>.tsx`
  (one page each) and `blocks/sections/<slug>/` (framed variants), listed in
  `blocks/registry.ts`. The Appearance panel (`lib/appearance.ts`) sets the
  --ui-* tokens on <html>, as an app would.
- Tailwind's dev server doesn't always scan new folders: restart it if a new
  file's classes are missing (a production build has them).

## Every component

- A shortcut (`function CheckboxShortcut`) exported with its parts:
  `export const Checkbox = withParts(CheckboxShortcut, { Root: Ark.Root, … })`.
  Parts are Ark's own where Ark has them; parts of our own (Dialog's Header,
  Body, Footer) are `partOf(scope, name)`.
- Exports its props type (`CheckboxProps`): Ark's root props (`Ark.RootProps`)
  with ours added, `Omit`ting what we replace (`onCheckedChange`, and `label`,
  which Ark types as a string). `classes` is `Classes<…>` of its part names.
- A middle layer where it helps (Dialog): the shortcut also takes our
  layout parts as children (Dialog.Header, Body, Footer), placing them as-is
  and keeping the machinery (portal, backdrop, positioner) to itself.
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

- Zag in React applies a machine's state on the next render: an api call
  (`setHighlightValue`) isn't visible to a key event sent straight after it,
  so wait a tick (SearchSelect's keep-place does). Keep the latest api in a
  ref for timers and promises.
- A component that needs the api itself (Select, TagsInput, PasswordInput,
  DatePicker) uses Ark's hook (`useSelect`…) and `<Ark.RootProvider value={…}>`.
- Ark's Label (and other parts) must sit inside its Root: our roots hold the
  label and an items row (RadioGroup's `items`, Segmented's `group`).
- Segmented is Ark's SegmentGroup, scope `segment-group` (svelte-ui's
  `segmented`), so its by-hand parts get the CSS.
- Generic item components type `value` as `NoInfer<…>`, or TypeScript infers
  the item type from the value (a number) instead of `items`.
- Ark Root props include HTML attributes typed as strings (`label`, `prefix`):
  `Omit` them before adding ours.
- Zag reads the Field context only in some machines (select, combobox,
  checkbox, switch, number/password/pin/tags input, file upload). For the
  rest (radio, segment, slider, date picker) pass `ids.label` and
  `aria-describedby={field?.ariaDescribedby}` by hand.
- FileUpload keeps accepted files from `onFileAccept`: `onFileChange` also
  fires for rejections with the accepted list from before the render, which
  would undo a drop of good and bad files together.
- FileUpload past maxFiles: Zag would reject the whole drop, so it gets no
  limit and `validate` takes files in order until there's no room (using
  Zag's own type and size checks from @zag-js/file-utils, so only files Zag
  would take count). Rejected files sit in their own ItemGroup type="rejected":
  an item's group is how Zag knows which list its delete button removes from.
- Zag's file input listens for `input`, not `change` (a test script must
  fire `input`); tags input adds on an input event ending in the delimiter,
  so a test that inserts "a," in one go adds nothing.
- A multiple SearchSelect's list stays open when Tab leaves it, and its layer
  swallows the next field's typing: the component closes it on focus-out.
- Menu: our item components (Menu.Item…) sit beside Ark's raw parts on
  Menu. `items` checkbox/radio entries take Zag's option props through
  `useMenuContext` (Ark's RadioItem wants a RadioItemGroup round it). Zag
  moves focus into an opened menu in an animation frame: in a hidden pane,
  keys sent straight after opening still go to the trigger.
- iconify-icon fetches its icon when it first renders: content mounted on
  first open (lazyMount) grows as its icons arrive. Menus stay mounted
  (hidden) from the start, as in svelte-ui, so their icons are ready.
- Sheet runs Ark's dialog under the `sheet` scope: every part, its own
  Header/Title too, passes data-scope="sheet", or Dialog's CSS applies.
- Zag types `toaster.loading` as void though it returns the id: use
  `toaster.create({ type: 'loading', … })` where the id matters.
- Components that build a new value from the current one (CheckboxGroup)
  read it from a ref of the latest, so two changes before a render stack.
- Ark renders Separator as an <hr>: CSS clears its border.
- `closest()` walks past the element you mean: Table's row click checks that
  the control it finds is inside the row (a Card round the table has a scope).
- AppShell shares its state (rail, mobile, drawer, toggle) through
  ShellContext (`useShell()`); Page resets it to null for its content, so a
  Sidebar shown inside a page isn't the app's. Our own components without Ark
  parts (Sidebar's NavSection…) hang off the shortcut as Sidebar.Section….
- Zag's dialog calls onOpenChange only for its own opens (trigger, Escape):
  an `open` changed from outside (or our hotkey) doesn't, so work done on
  opening (Command's reset) runs in an effect on `open`.
- Command keeps Ark's Listbox parts under their own scope (`listbox`); its
  CSS targets them inside the command's content.
- Ark's Progress.ValueText shows the percentage whatever formatOptions or
  translations say; the shortcut renders Zag's valueAsString instead.
- Zag won't clear a disabled item (hideSelected disables picks): remove picks
  through our own state.

- typescript-eslint supports TypeScript < 6.1, so TypeScript stays on 6.0.
- Input's `type` union lists React's known input types without its
  `string & {}` catch-all, or `type="number"` matches both members and
  `onValueChange`'s argument isn't inferred.
- Change handlers get the plain value, typed for what a user can do:
  Checkbox's is a boolean (a click never leaves it indeterminate).
- Zag's select opens on pointerdown: a script's `.click()` doesn't open it;
  an accordion trigger ignores a script's `.click()` too (use a real click).
- Ark's Checkbox.Indicator shows for checked only; the dash needs a second
  `<Indicator indeterminate>`, and the CSS hides `[hidden]` ones.
- Field `required` makes Ark's hidden inputs required, so the browser
  validates before onSubmit: `noValidate` on forms that show their own errors.
- The in-app browser throttles while its pane is hidden: screenshots can be
  stale. Check state with scripts.
