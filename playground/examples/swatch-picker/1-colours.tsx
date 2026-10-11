/* Colours
  Tailwind's colours by name (or your own `{ value, color }`); `swatches[name]` gives the CSS colour, e.g. for a vet's calendar colour. */
import { useState } from 'react'
import { SwatchPicker, swatches, Avatar } from '@milktop/react-ui'

export default function Example() {
  const [color, setColor] = useState<string | null>('teal')
  return <>
    <SwatchPicker label="Calendar colour" value={color} onValueChange={setColor} className="col-span-full" />
    <SwatchPicker label="A few" size="sm" items={['teal', 'violet', 'amber', 'rose', { value: 'brand', color: '#0f172a', label: 'Brand' }]} defaultValue="brand" />
    <div className="col-span-full flex items-center gap-2 text-sm text-(--ui-muted)">color: {JSON.stringify(color)}
      {color && <span className="inline-block size-4 rounded-full" style={{ background: swatches[color] }} />}
      <Avatar size="sm" name="Dr Jones" style={{ background: color ? swatches[color] : undefined, color: 'white' }} /></div>
  </>
}
