/* A vet clinic's day
  `resources`: a column per vet, here with 15-minute slots. Drag an appointment to another vet or time (or use the arrow keys: ←→ change vet), drag down an empty column to book; hold Shift to block the time instead, or select in the all-day strip to mark a vet away. `rows` adds the day's messages along the top (click the row to add one). `renderResource` and `renderEvent` draw the vets and the appointments: pet, species and owner, coloured by kind. Switch to 3 days to see each vet across several days. */
import { useState } from 'react'
import { EventCalendar, Avatar, Badge, toaster, type CalendarChange, type CalendarSelection } from '@milktop/react-ui'
import { vets, appointments as initial, type Appointment } from './clinic'
import { day } from './lessons'

// The day's messages for the team, as in Perigovet: a row above the all-day strip.
type Message = { id: number, date: string, text: string, urgent?: boolean }
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const species = { dog: 'lucide:dog', cat: 'lucide:cat', rabbit: 'lucide:rabbit', bird: 'lucide:bird' }

export default function Example() {
  const [appointments, setAppointments] = useState(initial)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, date: day((new Date().getDay() + 6) % 7), text: 'X-ray machine serviced at 14:00', urgent: true },
    { id: 2, date: day((new Date().getDay() + 6) % 7), text: 'Order more rabies vaccine' },
  ])

  function update(appointment: Appointment, change: CalendarChange) {
    setAppointments(appointments.map((a) => (a.id === appointment.id ? { ...a, ...change } : a)))
  }

  function book({ start, end, resourceId, allDay }: CalendarSelection, { shiftKey }: { shiftKey: boolean }) {
    const vet = vets.find((v) => v.id === resourceId)
    // Shift held: block the time (or the day) instead of booking it.
    if (shiftKey || allDay) {
      setAppointments([...appointments, {
        id: `block-${Date.now()}`, resourceId, start, end, allDay, title: allDay ? 'Away' : 'Blocked', pet: allDay ? 'Away' : 'Blocked',
        species: 'dog', owner: '', kind: 'Check-up', color: 'neutral', editable: !allDay,
      }])
      return toaster.info({ title: `${vet?.title}: ${allDay ? 'away' : 'time blocked'}` })
    }
    setAppointments([...appointments, {
      id: `new-${Date.now()}`, resourceId, start, end, title: 'New patient', pet: 'New patient', species: 'dog', owner: '—', kind: 'Consult', color: 'accent',
    }])
    toaster.success({ title: `Booked with ${vet?.title}`, description: `${start.slice(11)} to ${end.slice(11)}` })
  }

  return (
    <EventCalendar events={appointments} resources={vets} defaultView="day" views={['day', 3]} slotMinutes={15} hourHeight="6rem"
      startHour={8} endHour={18} onEventChange={update} onSelect={book}
      rows={[{
        key: 'messages', label: <iconify-icon icon="lucide:mail" aria-label="Messages" />,
        onClick: (date) => {
          const text = prompt('Message for the team')
          if (text) setMessages([...messages, { id: Date.now(), date: iso(date), text }])
        },
        render: (date) => (
          <span className="flex flex-wrap gap-1">
            {messages.filter((m) => m.date === iso(date)).map((m) => (
              <button key={m.id} type="button" onClick={(e) => { e.stopPropagation(); toaster.info({ title: m.text }) }}
                className={`cursor-pointer rounded border-0 px-1.5 py-0.5 text-[11px] text-white ${m.urgent ? 'bg-red-500' : 'bg-amber-500'}`}>
                {m.text}
              </button>
            ))}
          </span>
        ),
      }]} eventLabel={(a) => `${a.pet}, ${a.kind}`}
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
