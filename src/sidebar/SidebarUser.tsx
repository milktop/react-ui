/**
 * The signed-in user, for the sidebar's footer: avatar, name and a line under
 * it, opening a menu of account actions upwards (to the right in the rail,
 * where only the avatar shows).
 *
 *   <SidebarUser name="Ada Lovelace" description="ada@example.com" items={account} onSelect={run} />
 *
 * It's a Menu with the user as its trigger: give it `items`, Menu's child
 * components, or both, and `onSelect` (the rest of Menu's props apply too).
 *
 * - `name`: who's signed in; `description`: a line under it (their email);
 *   `src`: their photo
 * - `placement`: where the menu opens ('top-start', or 'right-end' in the rail)
 * - `letters`, `color`: passed to the Avatar
 */
import type { ReactNode } from 'react'
import '../icons.js'
import { Menu, type MenuProps } from '../menu/Menu.js'
import { Avatar, type AvatarColor } from '../avatar/Avatar.js'
import { useShell } from '../app-shell/shell.js'
import { cx, partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './sidebar.css'

export type SidebarUserProps = Omit<MenuProps, 'trigger' | 'classes' | 'color'> & {
  name?: string
  description?: ReactNode
  src?: string | null
  letters?: 1 | 2
  color?: AvatarColor | 'auto'
  classes?: Classes<'root' | 'trigger' | 'text' | 'name' | 'description' | 'indicator'> & MenuProps['classes']
}

export function SidebarUser({
  name = '', description = null, src = null, letters = 2, color = 'accent', placement, className, classes, ...rest
}: SidebarUserProps) {
  const shell = useShell()
  const part = partsOf('sidebar-user', classes)
  const rail = !!shell?.rail

  return (
    <div {...part('root')} className={cx(className, classes?.root)} data-rail={rail || undefined}>
      <Menu {...rest} classes={classes} placement={placement ?? (rail ? 'right-end' : 'top-start')} trigger={
        <button {...part('trigger')} type="button" aria-label={rail ? name : undefined}>
          <Avatar name={name} src={src} size="sm" letters={letters} color={color} />
          <span {...part('text')}>
            <span {...part('name')}>{name}</span>
            {description && <span {...part('description')}>{description}</span>}
          </span>
          <iconify-icon {...part('indicator')} icon="lucide:chevrons-up-down" aria-hidden="true" />
        </button>
      } />
    </div>
  )
}
