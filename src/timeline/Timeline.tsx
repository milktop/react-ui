/**
 * Events down a line, e.g. a student's history.
 *
 *   <Timeline items={[
 *     { title: 'Lesson booked', time: '2 Oct', icon: 'lucide:calendar-plus' },
 *     { title: 'Invoice paid', time: '1 Oct', description: '£120', color: 'success' },
 *   ]} />
 *
 * Or as markup, when an event needs more than text:
 *
 *   <Timeline>
 *     <Timeline.Item title="Note added" time="30 Sep" icon="lucide:notebook-pen"><Card>…</Card></Timeline.Item>
 *   </Timeline>
 *
 * - `items`: objects with a Timeline.Item's props (only `title` is needed)
 * - `variant`: 'line' (default) or 'cards' (each item's content in a card)
 * - `size`: 'sm' or 'md' (default)
 * - Timeline.Item (also TimelineItem): `title`; `time` (text, so format it
 *   first); `description`, a line under the title; `icon`, an Iconify name in
 *   a circle (a dot without one); `color` tints the marker: 'accent',
 *   'success', 'warning' or 'danger' (grey by default). Its content shows
 *   under the title
 */
import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from 'react'
import 'iconify-icon'
import { cx, partsOf, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './timeline.css'

type ItemClasses = Classes<'item' | 'marker' | 'icon' | 'dot' | 'body' | 'header' | 'heading' | 'time' | 'description' | 'content'>

export type TimelineItemProps = Omit<LiHTMLAttributes<HTMLLIElement>, 'title' | 'color'> & {
  title?: ReactNode
  time?: ReactNode
  description?: ReactNode
  icon?: string | null
  color?: 'accent' | 'success' | 'warning' | 'danger' | null
  classes?: ItemClasses
}

export type TimelineProps = HTMLAttributes<HTMLDivElement> & {
  items?: TimelineItemProps[] | null
  variant?: 'line' | 'cards'
  size?: 'sm' | 'md'
  classes?: Classes<'root' | 'list'>
}

function TimelineShortcut({ items = null, variant = 'line', size = 'md', className, classes, children, ...rest }: TimelineProps) {
  const part = partsOf('timeline', classes)
  return (
    <div {...rest} {...part('root')} className={cx(className, classes?.root)} data-variant={variant} data-size={size}>
      <ol {...part('list')}>
        {(items ?? []).map((item, i) => <TimelineItem key={i} {...item} />)}
        {children}
      </ol>
    </div>
  )
}

/** One event in a Timeline; its content shows under the title. */
export function TimelineItem({
  title = null, time = null, description = null, icon = null, color = null, className, classes, children, ...rest
}: TimelineItemProps) {
  const part = partsOf('timeline', classes)
  return (
    <li {...rest} {...part('item')} className={cx(className, classes?.item)} data-color={color ?? 'neutral'}>
      <div {...part('marker')} aria-hidden="true">
        {icon ? <span {...part('icon')}><iconify-icon icon={icon} /></span> : <span {...part('dot')} />}
      </div>
      <div {...part('body')}>
        <div {...part('header')}>
          {title && <span {...part('heading')}>{title}</span>}
          {time && <time {...part('time')}>{time}</time>}
        </div>
        {description && <div {...part('description')}>{description}</div>}
        {children && <div {...part('content')}>{children}</div>}
      </div>
    </li>
  )
}

export const Timeline = withParts(TimelineShortcut, { Item: TimelineItem })
