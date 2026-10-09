/* Styling and replacing parts
  `classes` for any part, a token for one instance, and `prev`/`next` elements (they get the triggers' props) for your own buttons. */
import type { CSSProperties } from 'react'
import { DatePicker, Button } from '@milktop/react-ui'

export default function Example() {
  return <>
    <DatePicker label="Styled" defaultValue="2026-10-06"
      classes={{ prevTrigger: 'rounded-full bg-pink-100 text-pink-600', nextTrigger: 'rounded-full bg-pink-100 text-pink-600', viewTrigger: 'text-pink-700' }} />
    <DatePicker label="Rounder" defaultValue="2026-10-06" style={{ '--ui-radius': '14px', '--ui-accent': '#0d9488' } as CSSProperties} />
    <DatePicker label="Custom arrows" defaultValue="2026-10-06"
      prev={<Button size="sm" variant="ghost">← Earlier</Button>} next={<Button size="sm" variant="ghost">Later →</Button>} />
  </>
}
