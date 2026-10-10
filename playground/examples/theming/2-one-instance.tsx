/* One instance: tokens in `style`
  Set a token on a component (or any element round several) and only that part of the page changes. Here one button and one switch go green, and one card gets rounder. */
import { useState, type CSSProperties } from 'react'
import { Button, Switch, Card } from '@milktop/react-ui'

const green = { '--ui-accent': '#16a34a', '--ui-ring': '#16a34a', '--ui-ring-soft': '#16a34a33' } as CSSProperties

export default function Example() {
  const [on, setOn] = useState(true)
  return <>
    <Button variant="primary">The app's accent</Button>
    <Button variant="primary" style={green}>Just this one</Button>
    <Switch label="Green switch" checked={on} onCheckedChange={setOn} style={green} />
    <Card className="w-full" style={{ '--ui-radius': '16px' } as CSSProperties} heading="A rounder card">Only this card's radius changed.</Card>
  </>
}
