/* Variants
  'default' (bordered), 'elevated' (lifted), 'outline' (no fill) and 'subtle' (a tinted panel). */
import { Card } from '@milktop/react-ui'

const variants = [
  ['default', 'A bordered surface, for most things.'],
  ['elevated', 'Lifted by a shadow, for what should stand out.'],
  ['outline', 'Just a border, quiet on the canvas.'],
  ['subtle', 'A tinted fill, for a panel inside a page or card.'],
] as const

export default function Example() {
  return (
    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-4">
      {variants.map(([variant, text]) => (
        <Card key={variant} variant={variant} heading={variant[0].toUpperCase() + variant.slice(1)}><p className="m-0 text-(--ui-muted)">{text}</p></Card>
      ))}
    </div>
  )
}
