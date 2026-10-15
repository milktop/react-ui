/**
 * Light or dark (`colorScheme`), the accent colour and the sidebar style
 * (`appearance`), behind one button. The choices are saved.
 *
 *   <Appearance accents={['teal', 'blue', 'violet']} sidebars={['neutral', 'tint', 'dark']} />
 *   <Appearance dev />
 *
 * - `accents`, `sidebars`: what users may choose, by name (every one if left
 *   out; see `accents` and `sidebarStyles`). A saved choice outside them moves
 *   to their first item, so put the default first.
 * - `dev`: for trying themes out while building the app; take it off before
 *   shipping. Offers every accent and sidebar style whatever the lists say,
 *   any colour, a reset, and the `accents` and `sidebars` to paste for the
 *   current choice. Its switch turns dev mode off to preview what users get.
 * - `schemes`: false leaves out light and dark (e.g. with a ThemeToggle
 *   elsewhere)
 * - `placement`: where the panel opens ('bottom-end')
 * - `labels`: words over the locale's `appearance` ones
 * - `onChange`: called with appearance's value ({ accent, custom, sidebar })
 *   when the user changes it
 */
import { useEffect, useState, type HTMLAttributes } from 'react'
import { Popover, type PopoverProps } from '../popover/Popover.js'
import { Button } from '../button/Button.js'
import { Segmented } from '../segment-group/Segmented.js'
import { SwatchPicker } from '../swatch-picker/SwatchPicker.js'
import { NativeSelect } from '../native-select/NativeSelect.js'
import { Switch } from '../switch/Switch.js'
import { useColorScheme, type Scheme } from '../color-scheme.js'
import {
  appearance, accents as allAccents, sidebarStyles as allSidebars, useAppearance,
  type AccentName, type AppearanceValue, type SidebarStyle,
} from '../appearance.js'
import { cx, partsOf, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import type { Messages } from '../format/messages.js'
import '../theme.css'
import './appearance.css'

export type AppearanceProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  accents?: string[] | null
  sidebars?: string[] | null
  dev?: boolean
  schemes?: boolean
  placement?: PopoverProps['placement']
  labels?: Partial<Messages['appearance']> | null
  onChange?: (value: AppearanceValue) => void
  classes?: Classes<'root' | 'trigger' | 'panel' | 'setting' | 'label' | 'hint' | 'custom' | 'dev' | 'config'>
}

const schemeIcons: Record<Scheme, string> = { system: 'lucide:monitor', light: 'lucide:sun', dark: 'lucide:moon' }

export function Appearance({
  accents = null, sidebars = null, dev = false, schemes = true, placement = 'bottom-end', labels = null, onChange,
  className, classes, ...rest
}: AppearanceProps) {
  const t = useMessages()
  const words = { ...t.appearance, ...labels }
  const part = partsOf('appearance', classes)
  const { scheme, dark, setScheme } = useColorScheme()
  const value = useAppearance()
  const [devMode, setDevMode] = useState(true)
  const exploring = dev && devMode

  // In the lists' own order (the first is the fallback), or every one
  const accentNames = exploring || !accents ? Object.keys(allAccents) : accents.filter((name) => name in allAccents)
  const sidebarNames: string[] = exploring || !sidebars ? [...allSidebars] : sidebars.filter((name) => allSidebars.includes(name as SidebarStyle))

  const schemeItems = (['system', 'light', 'dark'] as const).map((s) => ({ value: s, label: t.themeToggle[s], icon: schemeIcons[s] }))
  const accentItems = accentNames.map((name) => ({ value: name, label: words.accents[name] ?? name, color: allAccents[name as AccentName][0][6] }))
  const sidebarItems = sidebarNames.map((name) => ({ value: name, label: words.sidebars[name] ?? name }))

  // A saved choice outside the lists moves to their first item.
  const allowedAccents = accentNames.join()
  const allowedSidebars = sidebarNames.join()
  useEffect(() => {
    if (!exploring) appearance.restrict(allowedAccents.split(','), allowedSidebars.split(','))
  }, [exploring, allowedAccents, allowedSidebars])

  // The current choice as code to paste into the app: the props that offer
  // it, or for a custom colour, the default that sets it.
  const config = value.custom
    ? `appearance.defaults = ${JSON.stringify({ custom: value.custom, sidebar: value.sidebar })}`
    : `accents={['${value.accent}']} sidebars={['${value.sidebar}']}`

  function pick(changes: Partial<AppearanceValue>) {
    appearance.update(changes)
    onChange?.(appearance.value)
  }

  function reset() {
    appearance.reset()
    onChange?.(appearance.value)
  }

  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)}>
      <Popover heading={words.label} placement={placement}
        trigger={<Button className={classes?.trigger} variant="ghost" icon="lucide:palette" aria-label={words.label} />}>
        <div {...part('panel')}>
          {schemes && (
            <div {...part('setting')}>
              <div {...part('label')}>{words.mode}</div>
              <Segmented size="sm" items={schemeItems} value={scheme} aria-label={words.mode}
                onValueChange={(next) => next && setScheme(next)} />
            </div>
          )}
          <div {...part('setting')}>
            <div {...part('label')}>{words.accent}</div>
            <SwatchPicker size="sm" items={accentItems} value={value.custom ? null : value.accent} aria-label={words.accent}
              onValueChange={(next) => next && pick({ accent: next as AccentName, custom: null })} />
          </div>
          {exploring && (
            <label {...part('custom')}>
              <input type="color" value={value.custom ?? appearance.scale[6]} onChange={(e) => pick({ custom: e.target.value })} />
              <span>{words.custom}</span>
              {value.custom && <code>{value.custom}</code>}
            </label>
          )}
          <div {...part('setting')}>
            <div {...part('label')}>
              <span>{words.sidebar}</span>
              {dark && <span {...part('hint')}>{words.lightOnly}</span>}
            </div>
            {sidebarItems.length <= 4
              ? <Segmented size="sm" items={sidebarItems} value={value.sidebar} aria-label={words.sidebar}
                  onValueChange={(next) => next && pick({ sidebar: next as SidebarStyle })} />
              : <NativeSelect size="sm" items={sidebarItems} value={value.sidebar} aria-label={words.sidebar}
                  onValueChange={(next) => next && pick({ sidebar: next as SidebarStyle })} />}
          </div>
          {dev && (
            <div {...part('dev')}>
              <Switch label={words.dev} checked={devMode} onCheckedChange={setDevMode} />
              {exploring && <>
                <code {...part('config')}>{config}</code>
                <Button size="sm" onClick={reset}>{words.reset}</Button>
              </>}
            </div>
          )}
        </div>
      </Popover>
    </div>
  )
}
