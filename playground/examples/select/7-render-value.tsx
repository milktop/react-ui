/* The chosen item, drawn your way
  `renderItem` draws the options; `renderValue` draws the chosen one in the box (and each tag, picking several). A searchable box holds typed text, so there `start` shows something before it: a node, or a function given the chosen item. */
import { useState } from 'react'
import { Select, Avatar, Badge } from '@milktop/react-ui'

type Vet = { id: number, name: string, role: string, status: 'online' | 'busy' | 'away' }
const vets: Vet[] = [
  { id: 1, name: 'Dr Jones', role: 'Small animals', status: 'online' },
  { id: 2, name: 'Dr Patel', role: 'Surgery', status: 'busy' },
  { id: 3, name: 'Dr Okafor', role: 'Exotics', status: 'away' },
  { id: 4, name: 'Nurse Kim', role: 'Vaccinations', status: 'online' },
]

const person = (vet: Vet, withRole = false) => (
  <span className="flex min-w-0 items-center gap-2">
    <Avatar size={20} name={vet.name.replace(/^(Dr|Nurse) /, '')} color="auto" status={vet.status} />
    <span className="truncate">{vet.name}</span>
    {withRole && <span className="truncate text-xs text-(--ui-muted)">{vet.role}</span>}
  </span>
)

const priorities = [
  { value: 'high', label: 'High', icon: 'lucide:chevrons-up', color: 'text-red-500' },
  { value: 'normal', label: 'Normal', icon: 'lucide:equal', color: 'text-amber-500' },
  { value: 'low', label: 'Low', icon: 'lucide:chevrons-down', color: 'text-sky-500' },
]
const icon = (p: (typeof priorities)[number]) => <iconify-icon icon={p.icon} className={p.color} />

export default function Example() {
  const [vet, setVet] = useState<number | null>(2)
  const [team, setTeam] = useState<number[]>([1, 4])
  const [searched, setSearched] = useState<number | null>(1)
  const [priority, setPriority] = useState<string | null>('high')

  return <>
    <Select label="Vet" items={vets} labelKey="name" valueKey="id" value={vet} onValueChange={setVet}
      renderItem={(v) => person(v, true)} renderValue={(v) => person(v)} />
    <Select label="Team" items={vets} labelKey="name" valueKey="id" multiple tags value={team} onValueChange={setTeam}
      renderItem={(v) => person(v, true)} renderValue={(v) => person(v)} />
    <Select label="Vet (searchable)" items={vets} labelKey="name" valueKey="id" searchable value={searched} onValueChange={setSearched}
      start={(v) => v ? <Avatar size={20} name={v.name.replace(/^(Dr|Nurse) /, '')} color="auto" /> : <iconify-icon icon="lucide:search" />}
      renderItem={(v) => person(v, true)} />
    <Select label="Priority" items={priorities} value={priority} onValueChange={setPriority}
      start={(p) => p && icon(p)} renderItem={(p) => <span className="flex items-center gap-2">{icon(p)}{p.label}</span>} />
    <p>{JSON.stringify({ vet, team, searched, priority })} <Badge size="sm">start = before, renderValue = instead</Badge></p>
  </>
}
