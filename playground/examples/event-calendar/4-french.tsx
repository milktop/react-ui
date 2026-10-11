/* In French, with a full all-day strip
  `translations` for its words and `locale` for the dates and times, editable like the others (select, move, resize, right-click). Past `allDayMax` lanes the all-day strip folds into "+3 de plus"; the label opens it. */
import { useState } from 'react'
import { EventCalendar, toaster, type CalendarChange, type CalendarSelection } from '@milktop/react-ui'
import { lessons, day, type Lesson } from './lessons'

const busy = [0, 1, 2, 3].map((n) => ({ id: `fete-${n}`, title: ['Formation', 'Inventaire', 'Congrès', 'Portes ouvertes'][n], student: '', subject: '',
  start: day(n % 2), end: day(2 + (n % 2)), allDay: true, color: (['accent', 'success', 'warning', 'neutral'] as const)[n] }))

export default function Example() {
  const [events, setEvents] = useState<Lesson[]>([...lessons, ...busy])
  const add = ({ start, end, allDay }: CalendarSelection) =>
    setEvents([...events, { id: Date.now(), title: allDay ? 'Journée bloquée' : 'Nouveau cours', student: '', subject: '', start, end, allDay, color: allDay ? 'neutral' : 'accent' }])
  const update = (event: Lesson, change: CalendarChange) => setEvents(events.map((e) => (e.id === event.id ? { ...e, ...change } : e)))
  const remove = (event: Lesson) => setEvents(events.filter((e) => e.id !== event.id))

  return (
    <EventCalendar events={events} onSelect={add} onEventChange={update}
      onEventClick={(event) => toaster.info({ title: String(event.title) })}
      eventMenu={(event) => [
        { label: 'Ouvrir', icon: 'lucide:file-text', onSelect: () => toaster.info({ title: String(event.title) }) },
        { separator: true },
        { label: 'Supprimer', icon: 'lucide:trash-2', danger: true, onSelect: () => remove(event) },
      ]}
      slotMenu={(slot) => [{ label: slot.allDay ? 'Bloquer la journée' : `Ajouter un cours à ${slot.start.slice(11)}`, icon: 'lucide:plus', onSelect: () => add(slot) }]} locale="fr-FR" views={['day', 'week']} allDayMax={3} startHour={8} endHour={20}
      translations={{
        today: "Aujourd'hui", previous: 'Précédent', next: 'Suivant', allDay: 'Journée', view: 'Vue', pickDate: 'choisir une date',
        day: 'Jour', week: 'Semaine', workweek: 'Semaine de travail', days: (n) => `${n} jours`,
        more: (n) => `+${n} de plus`, less: 'Moins', unavailable: 'Indisponible', cancel: 'Annuler',
        placing: (name) => `Déplacement de ${name} : cliquez sur un créneau, ou Échap pour annuler.`,
        selected: (when) => `Sélectionné : ${when}.`, moved: (name, when) => `${name} déplacé à ${when}.`, resized: (name, time) => `${name} finit maintenant à ${time}.`,
      }} />
  )
}
