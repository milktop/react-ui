/**
 * A page: its header (heading, description, actions) and content, at a
 * readable width.
 *
 *   <Page heading="Students" description="12 students" actions={<Button variant="primary">Add student</Button>}>
 *     …content…
 *   </Page>
 *
 * - `heading`, `description`
 * - `width`: 'narrow', 'default', 'wide' or 'full'
 * - `align`: 'center' or 'start'
 * - `actions`, `breadcrumbs`: shown in the header
 *
 * When the shell scrolls the page rather than the window, the page can take
 * focus (so the keyboard scrolls it) and is marked `scroll-region`, so
 * Inertia resets and restores its scroll on visits as it does the window's.
 *
 * What's inside a Page isn't the shell's: a Sidebar shown in the page (as an
 * example, say) doesn't collapse or turn into a drawer with the app's.
 */
import type { HTMLAttributes, ReactNode } from 'react'
import { cx, partsOf, type Classes } from '../utils.js'
import { ShellContext, useShell } from '../app-shell/shell.js'
import '../theme.css'
import './page.css'

export type PageProps = HTMLAttributes<HTMLDivElement> & {
  heading?: ReactNode
  description?: ReactNode
  width?: 'narrow' | 'default' | 'wide' | 'full'
  align?: 'center' | 'start'
  actions?: ReactNode
  breadcrumbs?: ReactNode
  classes?: Classes<'root' | 'inner' | 'header' | 'breadcrumbs' | 'titles' | 'heading' | 'description' | 'actions' | 'content'>
}

export function Page({
  heading = null, description = null, width = 'default', align = 'center', actions = null, breadcrumbs = null,
  className, classes, children, ...rest
}: PageProps) {
  const part = partsOf('page', classes)
  const scrolls = !!useShell()?.pageScroll
  const scrolling = scrolls ? { tabIndex: -1, 'scroll-region': '' } : {}

  return (
    <div {...scrolling} {...rest} {...part('root')} className={cx(className, classes?.root)} data-width={width} data-align={align}>
      <div {...part('inner')}>
        {(heading || description || actions || breadcrumbs) && (
          <header {...part('header')}>
            {breadcrumbs && <div {...part('breadcrumbs')}>{breadcrumbs}</div>}
            <div {...part('titles')}>
              <div>
                {heading && <h1 {...part('heading')}>{heading}</h1>}
                {description && <p {...part('description')}>{description}</p>}
              </div>
              {actions && <div {...part('actions')}>{actions}</div>}
            </div>
          </header>
        )}
        <div {...part('content')}><ShellContext value={null}>{children}</ShellContext></div>
      </div>
    </div>
  )
}
