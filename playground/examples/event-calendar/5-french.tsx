/* In French, with a full all-day strip
  Inside a `LocaleProvider locale="fr-FR"`: French words (built in) and dates; `translations` changes any word (here "Moins" for "Show less"). Editable like the others (select, move, resize, right-click). Past `allDayMax` lanes the all-day strip folds into "+3 de plus"; the label opens it. */
import { useState } from 'react'
import { EventCalendar, LocaleProvider, confirm, toaster, type CalendarChange, type CalendarSelection } from '@milktop/react-ui'
import { lessons, day, type Lesson } from './lessons'

const busy = [0, 1, 2, 3].map((n) => ({ id: `fete-${n}`, title: ['Formation', 'Inventaire', 'Congrès', 'Portes ouvertes'][n], student: '', subject: '',
  start: day(n % 2), end: day(2 + (n % 2)), allDay: true, color: (['accent', 'success', 'warning', 'neutral'] as const)[n] }))

export default function Example() {
  const [events, setEvents] = useState<Lesson[]>([...lessons, ...busy])
  const add = ({ start, end, allDay }: CalendarSelection) =>
    setEvents([...events, { id: Date.now(), title: allDay ? 'Journée bloquée' : 'Nouveau cours', student: '', subject: '', start, end, allDay, color: allDay ? 'neutral' : 'accent' }])
  // Selecting a time asks first (choosing it from the menu already says so).
  const time = (iso: string) => iso.slice(11)
  async function ask(slot: CalendarSelection) {
    const when = slot.allDay
      ? (slot.start === slot.end ? slot.start : `du ${slot.start} au ${slot.end}`)
      : `${slot.start.slice(0, 10)}, de ${time(slot.start)} à ${time(slot.end)}`
    const ok = await confirm({
      heading: slot.allDay ? 'Bloquer ces journées ?' : 'Ajouter un cours ?', description: when,
      confirmLabel: slot.allDay ? 'Bloquer' : 'Ajouter',
    })
    if (ok) add(slot)
  }
  const update = (event: Lesson, change: CalendarChange) => setEvents(events.map((e) => (e.id === event.id ? { ...e, ...change } : e)))
  const remove = (event: Lesson) => setEvents(events.filter((e) => e.id !== event.id))

  return (
    <LocaleProvider locale="fr-FR">
      <EventCalendar events={events} onSelect={ask} onEventChange={update}
        onEventClick={(event) => toaster.info({ title: String(event.title) })}
        eventMenu={(event) => [
          { label: 'Ouvrir', icon: 'lucide:file-text', onSelect: () => toaster.info({ title: String(event.title) }) },
          { separator: true },
          { label: 'Supprimer', icon: 'lucide:trash-2', danger: true, onSelect: () => remove(event) },
        ]}
        slotMenu={(slot) => [{ label: slot.allDay ? 'Bloquer la journée' : `Ajouter un cours à ${slot.start.slice(11)}`, icon: 'lucide:plus', onSelect: () => add(slot) }]} views={['day', 'week']} allDayMax={3} startHour={8} endHour={20}
        translations={{ less: 'Moins' }} />
    </LocaleProvider>
  )
}
