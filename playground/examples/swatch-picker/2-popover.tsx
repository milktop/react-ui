/* In a popover, or a Select
  `variant="popover"`: a field showing the chosen colour, opening the swatches (it closes once one's chosen); it works in a Field like the other inputs. Or our Select: `renderItem` draws the options, `renderValue` the chosen one, and `start` puts the dot before a searchable box. */
import { useState } from 'react'
import { SwatchPicker, Select, Field, swatches } from '@milktop/react-ui'

const names = ['teal', 'violet', 'amber', 'rose', 'sky', 'emerald']
const dot = (name: string) => <span className="inline-block size-3 shrink-0 rounded-full" style={{ background: swatches[name] }} />

export default function Example() {
  const [vet, setVet] = useState<string | null>('teal')
  const [room, setRoom] = useState<string | null>(null)
  const [team, setTeam] = useState<string | null>('violet')
  return <>
    <SwatchPicker variant="popover" label="Dr Jones's colour" value={vet} onValueChange={setVet} />
    <Field label="Room colour" hint="In a Field, with a placeholder">
      <SwatchPicker variant="popover" items={names} value={room} onValueChange={setRoom} />
    </Field>
    {/* renderItem draws the options; renderValue the chosen one in the box. */}
    <Select label="Team colour (a Select)" items={names} value={team} onValueChange={setTeam}
      renderItem={(name) => <span className="flex items-center gap-2">{dot(name)}<span className="capitalize">{name}</span></span>}
      renderValue={(name) => <span className="flex items-center gap-2">{dot(name)}<span className="capitalize">{name}</span></span>} />
    {/* Searchable: the box is typed text, so the dot goes in `start`. */}
    <Select label="Searchable, with start" items={names} searchable value={team} onValueChange={setTeam}
      start={(name) => (name ? dot(name) : <iconify-icon icon="lucide:palette" />)}
      renderItem={(name) => <span className="flex items-center gap-2">{dot(name)}<span className="capitalize">{name}</span></span>} />
    <p>{JSON.stringify({ vet, room, team })}</p>
  </>
}
