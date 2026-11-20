/**
 * What to show where a list or page has nothing yet.
 *
 *   <EmptyState icon="lucide:users" heading="No students yet" description="Add one to start booking lessons.">
 *     <Button variant="primary">Add student</Button>
 *   </EmptyState>
 *
 * - `icon`: an Iconify name; `heading`, `description`
 * - `size`: `sm` for inside a card whose header already names what's empty: one quiet line, no icon
 * - the content: actions, e.g. a button to create the first item
 */
import type { ComponentProps, ReactNode } from 'react'
import '../icons.js'
import { cx, partsOf, type Classes } from '../utils.js'
import '../theme.css'
import './empty-state.css'

export type EmptyStateProps = Omit<ComponentProps<'div'>, 'title'> & {
  icon?: string | null
  size?: 'sm' | 'md'
  heading?: ReactNode
  description?: ReactNode
  classes?: Classes<'root' | 'iconWrap' | 'icon' | 'heading' | 'description' | 'actions'>
}

export function EmptyState({ icon = null, size = 'md', heading = null, description = null, className, classes, children, ...rest }: EmptyStateProps) {
  const part = partsOf('empty-state', classes)
  return (
    <div {...rest} {...part('root')} data-size={size} className={cx(className, classes?.root)}>
      {icon && size !== 'sm' && <span {...part('icon-wrap')}><iconify-icon {...part('icon')} icon={icon} aria-hidden="true" /></span>}
      {heading && <h3 {...part('heading')}>{heading}</h3>}
      {description && <p {...part('description')}>{description}</p>}
      {children != null && <div {...part('actions')}>{children}</div>}
    </div>
  )
}
