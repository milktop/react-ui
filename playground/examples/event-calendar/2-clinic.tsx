/* A vet clinic's day
  `resources`: a column per vet, here with 15-minute slots. Drag an appointment to another vet or time (or use the arrow keys: ←→ change vet), drag down an empty column to book. `renderResource` and `renderEvent` draw the vets and the appointments: pet, species and owner, coloured by kind. Switch to 3 days to see each vet across several days. */
import { useState } from 'react'
import { EventCalendar, Avatar, Badge, toaster, type CalendarChange } from '@milktop/react-ui'
import { vets, appointments as initial, type Appointment } from './clinic'

const species = { dog: 'lucide:dog', cat: 'lucide:cat', rabbit: 'lucide:rabbit', bird: 'lucide:bird' }

export default function Example() {
  const [appointments, setAppointments] = useState(initial)

  function update(appointment: Appointment, change: CalendarChange) {
    setAppointments(appointments.map((a) => (a.id === appointment.id ? { ...a, ...change } : a)))
  }

  function book({ start, end, resourceId }: CalendarChange) {
    const vet = vets.find((v) => v.id === resourceId)
    setAppointments([...appointments, {
      id: `new-${Date.now()}`, resourceId, start, end, title: 'New patient', pet: 'New patient', species: 'dog', owner: '—', kind: 'Consult', color: 'accent',
    }])
    toaster.success({ title: `Booked with ${vet?.title}`, description: `${start.slice(11)} to ${end.slice(11)}` })
  }

  return (
    <EventCalendar events={appointments} resources={vets} defaultView="day" views={['day', 3]} slotMinutes={15} hourHeight="6rem"
      startHour={8} endHour={18} onEventChange={update} onSelect={book} eventLabel={(a) => `${a.pet}, ${a.kind}`}
      onEventClick={(a) => toaster.info({ title: `${a.pet} (${a.owner})`, description: a.kind })}
      renderResource={(vet) => (
        <span className="flex min-w-0 items-center gap-2">
          <Avatar size="sm" name={vet.title.replace('Dr ', '')} color={vet.color} />
          <span className="min-w-0 text-left"><span className="block truncate">{vet.title}</span>
            <span className="block truncate text-xs font-normal text-(--ui-muted)">{vet.role}</span></span>
        </span>
      )}
      renderEvent={(a, { compact }) => (
        <span className={compact ? 'flex min-w-0 items-center gap-1.5' : 'flex min-w-0 flex-col gap-0.5'}>
          <span className="flex min-w-0 items-center gap-1.5 font-semibold">
            <iconify-icon icon={species[a.species]} /><span className="truncate">{a.pet}</span>
          </span>
          <span className="truncate text-(--ui-muted)">{a.owner}</span>
          {!compact && <span><Badge>{a.kind}</Badge></span>}
        </span>
      )} />
  )
}
