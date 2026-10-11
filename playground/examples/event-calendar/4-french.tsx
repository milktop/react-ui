/* In French, with a full all-day strip
  `translations` for its words and `locale` for the dates and times. Past `allDayMax` lanes the all-day strip folds into "+2 de plus"; the label opens it. */
import { EventCalendar } from '@milktop/react-ui'
import { lessons, day } from './lessons'

const busy = [0, 1, 2, 3].map((n) => ({ id: `fete-${n}`, title: ['Formation', 'Inventaire', 'Congrès', 'Portes ouvertes'][n], student: '', subject: '',
  start: day(n % 2), end: day(2 + (n % 2)), allDay: true, color: (['accent', 'success', 'warning', 'neutral'] as const)[n] }))

export default function Example() {
  return (
    <EventCalendar events={[...lessons, ...busy]} locale="fr-FR" views={['day', 'week']} allDayMax={3} startHour={8} endHour={20}
      translations={{
        today: "Aujourd'hui", previous: 'Précédent', next: 'Suivant', allDay: 'Journée', view: 'Vue', pickDate: 'choisir une date',
        day: 'Jour', week: 'Semaine', workweek: 'Semaine de travail', days: (n) => `${n} jours`,
        more: (n) => `+${n} de plus`, less: 'Moins', unavailable: 'Indisponible', cancel: 'Annuler',
        placing: (name) => `Déplacement de ${name} : cliquez sur un créneau, ou Échap pour annuler.`,
        selected: (when) => `Sélectionné : ${when}.`, moved: (name, when) => `${name} déplacé à ${when}.`, resized: (name, time) => `${name} finit maintenant à ${time}.`,
      }} />
  )
}
