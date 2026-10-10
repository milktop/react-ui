// The appearance panel: a popover of settings that override the library's
// tokens, as in imba-ui's and svelte-ui's playgrounds.
import { Popover, Button, Fields, Field, Segmented, Select, useColorScheme, type Scheme } from '@milktop/react-ui'
import {
  useAppearance, setAppearance, resetAppearance, accents, fonts, radii, densities, layouts, canvases, sidebars, widths, aligns, options,
  type Appearance,
} from './appearance'

const themes = [
  { value: 'light', label: 'Light', icon: 'lucide:sun' },
  { value: 'dark', label: 'Dark', icon: 'lucide:moon' },
  { value: 'system', label: 'System', icon: 'lucide:monitor' },
]

export function AppearancePanel() {
  const appearance = useAppearance()
  const { scheme, dark, setScheme } = useColorScheme()
  // A Segmented bound to one setting.
  const choose = <K extends keyof Appearance>(key: K, map: Record<string, string[] | { label: string }>) => (
    <Segmented size="sm" items={options(map)} value={appearance[key]} onValueChange={(value) => value && setAppearance({ [key]: value } as Partial<Appearance>)} />
  )

  return (
    <Popover heading="Appearance" description="Overrides the --ui-* tokens on <html>." closable placement="bottom-end"
      className="max-h-[calc(100vh-80px)] w-[min(40rem,calc(100vw-32px))] overflow-y-auto"
      trigger={<Button size="sm" variant="ghost" icon="lucide:palette" aria-label="Appearance" />}>
      <Fields classes={{ grid: 'grid-cols-1 sm:grid-cols-2 gap-x-6 [&>*]:col-auto' }}>
        <Field label="Theme"><Segmented size="sm" items={themes} value={scheme} onValueChange={(value) => setScheme(value as Scheme)} /></Field>
        <Field label="Accent">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Accent">
            {Object.entries(accents).map(([key, accent]) => (
              <button key={key} type="button" role="radio" aria-checked={appearance.accent === key} aria-label={accent.name}
                style={{ background: accent[dark ? 'dark' : 'light'][0] }} onClick={() => setAppearance({ accent: key as Appearance['accent'] })}
                className="size-7 cursor-pointer rounded-full border-2 border-(--ui-surface) p-0 outline-1 outline-(--ui-border) outline-solid hover:outline-(--ui-muted) aria-checked:outline-2 aria-checked:outline-(--ui-text)" />
            ))}
          </div>
        </Field>
        <Field label="Font">
          <Select size="sm" items={options(fonts)} value={appearance.font} onValueChange={(font) => font && setAppearance({ font: font as Appearance['font'] })} />
        </Field>
        <Field label="Radius">{choose('radius', radii)}</Field>
        <Field label="Layout" hint="AppShell's inset option">{choose('layout', layouts)}</Field>
        <Field label="Background" hint="--ui-canvas, in light mode">{choose('canvas', canvases)}</Field>
        <Field label="Sidebar" hint="--ui-sidebar-bg (inset layout)">{choose('sidebar', sidebars)}</Field>
        <Field label="Width" hint="Page's width">{choose('width', widths)}</Field>
        <Field label="Page" hint="Page's align">{choose('align', aligns)}</Field>
        <Field label="Density" hint="Sets --ui-control-height">{choose('density', densities)}</Field>
      </Fields>
      <div className="mt-4 flex justify-end"><Button variant="link" size="sm" onClick={resetAppearance}>Reset</Button></div>
    </Popover>
  )
}
