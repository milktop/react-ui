/**
 * A light, dark and system switch, driving `colorScheme`, so every toggle on
 * the page stays in step and the choice is saved.
 *
 *   <ThemeToggle />
 *   <ThemeToggle variant="menu" />
 *   <ThemeToggle mobile="menu" />
 *   <ThemeToggle variant="toggle" />
 *
 * - `variant`: 'segmented' (default: icon-only buttons with tooltips), 'menu'
 *   (one button showing the current choice, opening a menu of all of them) or
 *   'toggle' (one button flipping between light and dark)
 * - `mobile`: the variant below `breakpoint` (e.g. 'menu' where space is tight)
 * - `breakpoint`: the width in px `mobile` applies under (768)
 * - `options`: which schemes to offer, in order (system, light, dark)
 * - `system`: false leaves out 'system' whatever `options` says
 * - `labels`: the tooltips and accessible names, `{ light, dark, system }`
 * - `label`: names the group for assistive tech
 * - `size`: 'sm', 'md' (default) or 'lg', for every variant
 * - `placement`: where the menu variant opens ('bottom-end', or 'bottom' with `iconOnly`)
 * - `keepOpen`: the menu variant stays open after a choice
 * - `iconOnly`: the menu variant lists just the icons, the current one highlighted
 * - `onChange`: called with 'light', 'dark' or 'system'
 */
import { useEffect, useState, type ComponentProps } from 'react'
import { Menu } from '../menu/Menu.js'
import '../icons.js'
import { Segmented } from '../segment-group/Segmented.js'
import { Tooltip } from '../tooltip/Tooltip.js'
import { useColorScheme, type Scheme } from '../color-scheme.js'
import { cx, partsOf, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './theme-toggle.css'

type Variant = 'segmented' | 'menu' | 'toggle'

export type ThemeToggleProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  variant?: Variant
  mobile?: Variant | null
  breakpoint?: number
  options?: Scheme[]
  system?: boolean
  labels?: Record<Scheme, string>
  label?: string
  size?: 'sm' | 'md' | 'lg'
  placement?: NonNullable<Parameters<typeof Menu>[0]['placement']> | null
  keepOpen?: boolean
  iconOnly?: boolean
  onChange?: (scheme: Scheme) => void
  classes?: Classes<'root' | 'trigger' | 'triggerIcon'>
}

const icons: Record<Scheme, string> = { light: 'lucide:sun', dark: 'lucide:moon', system: 'lucide:monitor' }

// Whether the viewport is under `breakpoint` (only watched when `on`).
function useNarrow(on: boolean, breakpoint: number) {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    if (!on) return
    const query = matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const update = () => setNarrow(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [on, breakpoint])
  return narrow
}

export function ThemeToggle({
  variant = 'segmented', mobile = null, breakpoint = 768, options = ['system', 'light', 'dark'], system = true,
  labels: labelsProp, label: labelProp, placement = null,
  size = 'md', keepOpen = false, iconOnly = false, onChange, className, classes, ...rest
}: ThemeToggleProps) {
  const t = useMessages()
  const labels = labelsProp ?? t.themeToggle
  const label = labelProp ?? t.themeToggle.label
  const part = partsOf('theme-toggle', classes)
  const { scheme, dark, setScheme } = useColorScheme()
  const narrow = useNarrow(!!mobile, breakpoint)

  const mode = mobile && narrow ? mobile : variant
  const offersSystem = system && options.includes('system')
  const items = options.filter((s) => icons[s] && (s !== 'system' || system)).map((s) => ({ value: s, label: labels[s], icon: icons[s] }))
  // Without the system option, show what the OS currently resolves to.
  const value: Scheme = offersSystem ? scheme : dark ? 'dark' : 'light'
  const shown: Scheme = dark ? 'dark' : 'light'

  function pick(next: Scheme | null) {
    if (next == null || next === value) return
    setScheme(next)
    onChange?.(next)
  }

  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} role="group" aria-label={label}
      data-variant={mode} data-size={size} data-icon-only={(iconOnly && mode === 'menu') || undefined}>
      {mode === 'menu' ? (
        <Menu placement={placement ?? (iconOnly ? 'bottom' : 'bottom-end')} keepOpen={keepOpen}
          trigger={(
            <button {...part('trigger')} type="button" aria-label={`${label}: ${labels[value]}`}>
              <iconify-icon {...part('trigger-icon')} icon={icons[value]} aria-hidden="true" />
            </button>
          )}>
          <Menu.RadioGroup value={value} onValueChange={(next) => pick(next as Scheme)}>
            {items.map((item) => <Menu.Radio key={item.value} value={item.value} icon={item.icon}>{item.label}</Menu.Radio>)}
          </Menu.RadioGroup>
        </Menu>
      ) : mode === 'toggle' ? (
        // Flips what's showing, so 'system' becomes an explicit choice.
        <Tooltip content={labels[shown]}>
          <button {...part('trigger')} type="button" aria-label={labels.dark} aria-pressed={dark}
            onClick={() => pick(dark ? 'light' : 'dark')}>
            <iconify-icon {...part('trigger-icon')} icon={icons[shown]} aria-hidden="true" />
          </button>
        </Tooltip>
      ) : (
        <Segmented iconOnly size={size} items={items} value={value} onValueChange={pick} />
      )}
    </div>
  )
}
