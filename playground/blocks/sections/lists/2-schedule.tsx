/* A schedule, grouped by day
  Lessons under sticky day headings, with the time, length and where, and a check-off that strikes them through. */
import { useState } from 'react'
import { Card, Checkbox, Badge, cx } from '@milktop/react-ui'

const days = [
  { day: 'Today', lessons: [{ id: 1, time: '16:00', who: 'Ada Lovelace', what: 'Maths', where: 'Online' }, { id: 2, time: '17:30', who: 'Alan Turing', what: 'Physics', where: 'At home' }] },
  { day: 'Tomorrow', lessons: [{ id: 3, time: '10:00', who: 'Grace Hopper', what: 'English', where: 'Online' }] },
  { day: 'Saturday', lessons: [{ id: 4, time: '09:00', who: 'Katherine Johnson', what: 'Maths', where: 'Library' }, { id: 5, time: '11:00', who: 'Tim Berners-Lee', what: 'Chemistry', where: 'Online' }] },
]

export default function Schedule() {
  const [done, setDone] = useState<number[]>([1])
  return (
    <Card flush className="max-h-80 overflow-y-auto">
      {days.map(({ day, lessons }) => (
        <section key={day}>
          <h3 className="sticky top-0 z-1 m-0 border-b border-(--ui-border) bg-(--ui-surface) px-5 py-2 text-xs font-semibold text-(--ui-muted)">{day}</h3>
          {lessons.map((l) => (
            <div key={l.id} className="flex items-center gap-3 border-b border-(--ui-border) px-5 py-3 last:border-b-0">
              <Checkbox label={`Done: ${l.who}`} labelHidden checked={done.includes(l.id)}
                onCheckedChange={(on) => setDone(on ? [...done, l.id] : done.filter((id) => id !== l.id))} />
              <span className="w-12 text-sm font-semibold tabular-nums">{l.time}</span>
              <span className={cx('min-w-0 flex-1 text-sm', done.includes(l.id) && 'text-(--ui-muted) line-through')}>{l.who} · {l.what}</span>
              <Badge variant="outline">{l.where}</Badge>
            </div>
          ))}
        </section>
      ))}
    </Card>
  )
}
