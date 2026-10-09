/**
 * A card: a surface grouping related content.
 *
 *   <Card heading="Next lesson" description="Thursday at 16:00" icon="lucide:calendar"
 *     actions={<Button size="sm">Reschedule</Button>}>
 *     …body…
 *   </Card>
 *
 * - `heading`, `description`: the header; `icon`: an Iconify name in a
 *   tinted tile beside them
 * - `actions`: beside the heading; `footer`: a tinted strip along the bottom
 * - `variant`: 'default' (a bordered surface), 'elevated' (lifted, no
 *   border), 'outline' (a border, no fill or shadow) or 'subtle' (a tinted
 *   fill, for a panel inside a page or another card)
 * - `size`: 'sm', 'md' (default) or 'lg': the padding
 * - `divided`: a line between the header and the body
 * - `href`: the whole card is a link, lifting on hover
 * - `flush`: no padding round the body, for content that runs edge to edge (a table, a list)
 *
 * Or composed from Card.Header (which takes heading, description, icon and
 * actions too), Card.Body and Card.Footer, placed as they are:
 *
 *   <Card>
 *     <Card.Header heading="Invoices" actions={<Button size="sm">New</Button>} />
 *     <Card.Body>…</Card.Body>
 *     <Card.Footer>…</Card.Footer>
 *   </Card>
 */
import { Children, createElement, isValidElement, type ComponentProps, type ReactNode } from 'react'
import 'iconify-icon'
import { cx, partOf, partsOf, withParts, type Classes } from '../utils.js'
import '../theme.css'
import './card.css'

type HeaderContent = { heading?: ReactNode, description?: ReactNode, icon?: string | null, actions?: ReactNode }
type CardPart = 'root' | 'header' | 'icon' | 'titles' | 'heading' | 'description' | 'actions' | 'body' | 'footer'

export type CardProps = Omit<ComponentProps<'div'>, 'title'> & HeaderContent & {
  footer?: ReactNode
  variant?: 'default' | 'elevated' | 'outline' | 'subtle'
  size?: 'sm' | 'md' | 'lg'
  divided?: boolean
  href?: string | null
  flush?: boolean
  classes?: Classes<CardPart>
}

// The header's content, shared by the props version and Card.Header.
function headerContent({ heading, description, icon, actions }: HeaderContent, part: ReturnType<typeof partsOf>) {
  return <>
    {icon && <span {...part('icon')} aria-hidden="true"><iconify-icon icon={icon} /></span>}
    {(heading || description) && (
      <div {...part('titles')}>
        {heading && <h3 {...part('heading')}>{heading}</h3>}
        {description && <p {...part('description')}>{description}</p>}
      </div>
    )}
    {actions && <div {...part('actions')}>{actions}</div>}
  </>
}

type HeaderProps = ComponentProps<'div'> & HeaderContent & { classes?: Classes<CardPart> }
function Header({ heading = null, description = null, icon = null, actions = null, classes, className, children, ...rest }: HeaderProps) {
  const part = partsOf('card', classes)
  return (
    <div {...rest} {...part('header')} className={cx(className, classes?.header)}>
      {headerContent({ heading, description, icon, actions }, part)}
      {children}
    </div>
  )
}
const Body = partOf('card', 'body')
const Footer = partOf('card', 'footer')
const layout = [Header, Body, Footer] as unknown[]

function CardShortcut({
  heading = null, description = null, icon = null, actions = null, footer = null, variant = 'default', size = 'md',
  divided = false, href = null, flush = false, className, classes, children, ...rest
}: CardProps) {
  const part = partsOf('card', classes)
  // Composed from Card.Header, Body and Footer: they go in as they are.
  const composed = Children.toArray(children).some((node) => isValidElement(node) && layout.includes(node.type))

  return createElement(href ? 'a' : 'div', {
    ...rest, ...part('root'), href: href ?? undefined, className: cx(className, classes?.root),
    'data-variant': variant, 'data-size': size, 'data-flush': flush || undefined, 'data-divided': divided || undefined,
    'data-link': href ? '' : undefined,
  }, composed ? children : <>
    {(heading || description || actions || icon) && (
      <div {...part('header')}>{headerContent({ heading, description, icon, actions }, part)}</div>
    )}
    {children != null && <div {...part('body')}>{children}</div>}
    {footer && <div {...part('footer')}>{footer}</div>}
  </>)
}

export const Card = withParts(CardShortcut, { Header, Body, Footer })
