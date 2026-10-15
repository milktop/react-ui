/**
 * Labels and their values, as a description list (<dl>), e.g. a student's details.
 *
 *   <DataList items={[
 *     { label: 'Email', value: 'ada@example.com' },
 *     { label: 'Year', value: 11, info: 'School year in September' },
 *   ]} />
 *
 * Or as markup, when values need more than text:
 *
 *   <DataList>
 *     <DataList.Item label="Status"><Badge variant="success">Active</Badge></DataList.Item>
 *   </DataList>
 *
 * - `items`: `{ label, value, info }`
 * - `orientation`: 'horizontal' (default; labels beside values) or 'vertical' (labels above)
 * - `variant`: 'plain' (default), 'divided' (lines between items) or 'card'
 *   (a bordered box with lines between)
 * - `columns`: lays items out in a grid of this many columns (stacking on
 *   narrow screens); best with vertical items
 * - `labelWidth`: the label column's width when horizontal ('10rem')
 * - DataList.Item (also DataItem): `label`; `info` adds an icon with this
 *   text in a tooltip; its content is the value
 */
import { createContext, useContext, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import '../icons.js'
import { Tooltip } from '../tooltip/Tooltip.js'
import { cx, partsOf, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './data-list.css'

type Part = ReturnType<typeof partsOf>
type ItemClasses = Classes<'item' | 'label' | 'info' | 'value'>
const PartContext = createContext<Part | null>(null)

export type DataEntry = { label: ReactNode, value?: ReactNode, info?: ReactNode }

export type DataListProps = HTMLAttributes<HTMLDivElement> & {
  items?: DataEntry[] | null
  orientation?: 'horizontal' | 'vertical'
  variant?: 'plain' | 'divided' | 'card'
  columns?: number | null
  labelWidth?: string | null
  classes?: Classes<'root' | 'list'> & ItemClasses
}

function DataListShortcut({
  items = null, orientation = 'horizontal', variant = 'plain', columns = null, labelWidth = null,
  className, classes, style, children, ...rest
}: DataListProps) {
  const part = partsOf('data-list', classes)
  return (
    <PartContext value={part}>
      <div {...rest} {...part('root')} className={cx(className, classes?.root)} data-orientation={orientation} data-variant={variant}
        data-grid={columns ? '' : undefined}
        style={{ ...style, ...(columns && { '--columns': columns }), ...(labelWidth && { '--label-width': labelWidth }) } as CSSProperties}>
        <dl {...part('list')}>
          {(items ?? []).map((item, i) => <DataItem key={i} label={item.label} info={item.info}>{item.value ?? ''}</DataItem>)}
          {children}
        </dl>
      </div>
    </PartContext>
  )
}

export type DataItemProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & { label?: ReactNode, info?: ReactNode, classes?: ItemClasses }

/** One label and its value (the content), in a DataList. */
export function DataItem({ label = null, info = null, className, classes, children, ...rest }: DataItemProps) {
  const inherited = useContext(PartContext)
  const part = classes || !inherited ? partsOf('data-list', classes) : inherited
  return (
    <div {...rest} {...part('item')} className={cx(className, part('item').className)}>
      <dt {...part('label')}>
        <span>{label}</span>
        {info && (
          <Tooltip content={info}>
            <span {...part('info')} tabIndex={0} aria-label={typeof info === 'string' ? info : undefined}><iconify-icon icon="lucide:info" /></span>
          </Tooltip>
        )}
      </dt>
      <dd {...part('value')}>{children}</dd>
    </div>
  )
}

export const DataList = withParts(DataListShortcut, { Item: DataItem })
