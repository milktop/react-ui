/* A vet clinic's day
  A column per vet (`resources`), 15-minute slots, inside a fixed `height` that opens at the current time. Each vet's hours, lunch and clashes come from `isAvailable` (hatched, the reason on hover; drops and bookings there are refused). Drag to book; hold Shift to block time; select in the all-day strip to mark a vet away. Moves save for a moment (`pending`). Click an appointment, then Move…, to place it anywhere, even another week (`pinned`). The day's messages are an extra row. */
import { useState } from 'react'
import { EventCalendar, Avatar, Badge, toaster, type CalendarChange, type CalendarQuery, type CalendarSelection, type CalendarKeys } from '@milktop/react-ui'
import { vets, appointments as initial, type Appointment } from './clinic'
import { day } from './lessons'

// The day's messages for the team: a row above the all-day strip.
type Message = { id: number, date: string, text: string, urgent?: boolean }
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const species = { dog: 'lucide:dog', cat: 'lucide:cat', rabbit: 'lucide:rabbit', bird: 'lucide:bird' }

// Each vet's hours and lunch, as minutes of the day.
const hours: Record<string, { from: number, to: number, lunch?: [number, number], note: string }> = {
  jones: { from: 8 * 60, to: 17 * 60, lunch: [12 * 60 + 30, 13 * 60 + 30], note: 'Dr Jones works 8:00 to 17:00' },
  patel: { from: 9 * 60, to: 18 * 60, lunch: [13 * 60, 14 * 60], note: 'Dr Patel works 9:00 to 18:00' },
  okafor: { from: 8 * 60, to: 13 * 60, note: 'Dr Okafor works mornings only' },
  nurse: { from: 8 * 60, to: 16 * 60, lunch: [12 * 60, 12 * 60 + 30], note: 'Nurse Kim works 8:00 to 16:00' },
}
const minutes = (iso: string) => Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16))

export default function Example() {
  const [appointments, setAppointments] = useState(initial)
  const [pinned, setPinned] = useState<Appointment | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, date: day((new Date().getDay() + 6) % 7), text: 'X-ray machine serviced at 14:00', urgent: true },
    { id: 2, date: day((new Date().getDay() + 6) % 7), text: 'Order more rabies vaccine' },
  ])

  // The clinic's rules, in one place: hours, lunch, days away, clashes.
  function isAvailable({ start, end, resourceId, allDay, event, shading }: CalendarQuery<Appointment>): boolean | string {
    const vet = hours[String(resourceId)]
    if (!vet || allDay) return true
    const away = appointments.find((a) => a.allDay && a.resourceId === resourceId && a.start <= start.slice(0, 10) && a.end >= start.slice(0, 10))
    if (away) return `${vets.find((v) => v.id === resourceId)?.title} is away`
    const [from, to] = [minutes(start), minutes(end)]
    if (from < vet.from || to > vet.to) return vet.note
    if (vet.lunch && from < vet.lunch[1] && to > vet.lunch[0]) return 'Lunch'
    // Clashes only for bookings and drops: the shading needn't show them.
    if (shading) return true
    const clash = appointments.find((a) => !a.allDay && a !== event && a.resourceId === resourceId && a.start < end && a.end > start)
    return clash ? `Clashes with ${clash.pet}` : true
  }

  // Saved after a moment: pending meanwhile.
  function update(appointment: Appointment, change: CalendarChange) {
    setAppointments((all) => all.map((a) => (a.id === appointment.id ? { ...a, ...change, pending: true } : a)))
    setTimeout(() => setAppointments((all) => all.map((a) => (a.id === appointment.id ? { ...a, pending: false } : a))), 900)
    setPinned(null)
  }

  function book({ start, end, resourceId, allDay }: CalendarSelection, { shiftKey }: CalendarKeys) {
    const vet = vets.find((v) => v.id === resourceId)
    // Shift held, or a whole day: block it instead of booking it.
    if (shiftKey || allDay) {
      setAppointments([...appointments, {
        id: `block-${Date.now()}`, resourceId, start, end, allDay, blocked: true, title: allDay ? 'Away' : 'Blocked', pet: allDay ? 'Away' : 'Blocked',
        species: 'dog', owner: '', kind: 'Check-up', color: 'neutral',
      }])
      return toaster.info({ title: `${vet?.title}: ${allDay ? 'away' : 'time blocked'}` })
    }
    setAppointments([...appointments, {
      id: `new-${Date.now()}`, resourceId, start, end, title: 'New patient', pet: 'New patient', species: 'dog', owner: '—', kind: 'Consult', color: 'accent',
    }])
    toaster.success({ title: `Booked with ${vet?.title}`, description: `${start.slice(11)} to ${end.slice(11)}` })
  }

  return (
    <EventCalendar events={appointments} resources={vets} defaultView="day" views={['day', 3]} slotMinutes={15} hourHeight="5rem"
      startHour={8} endHour={18} height="34rem" scrollToTime="now"
      onEventChange={update} onSelect={book} isAvailable={isAvailable} onUnavailable={(reason) => toaster.error({ title: reason })}
      pinned={pinned} onPinnedChange={setPinned} eventLabel={(a) => `${a.pet}, ${a.kind}`}
      onEventClick={(a) => !a.blocked && toaster.info({
        title: `${a.pet} (${a.owner})`, description: a.kind, action: { label: 'Move…', onClick: () => setPinned(a) },
      })}
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
      }]}
      renderResource={(vet) => (
        <span className="flex min-w-0 items-center gap-2">
          <Avatar size="sm" name={vet.title.replace('Dr ', '')} color={vet.color} />
          <span className="min-w-0 text-left"><span className="block truncate">{vet.title}</span>
            <span className="block truncate text-xs font-normal text-(--ui-muted)">{vet.role}</span></span>
        </span>
      )}
      renderEvent={(a, { compact }) => a.blocked ? <span className="font-medium text-(--ui-muted)">{a.title}</span> : (
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
