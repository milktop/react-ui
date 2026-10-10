/* Weekdays, your own event content
  `days={5}` and the hours you teach; `renderEvent` draws each lesson (here an avatar and the subject); `actions` sit beside the toolbar's week. */
import { WeekCalendar, Avatar, Button } from '@milktop/react-ui'
import { lessons } from './lessons'

export default function Example() {
  return (
    <WeekCalendar events={lessons} days={5} startHour={9} endHour={19}
      actions={<Button size="sm" variant="primary" icon="lucide:calendar-plus">Book</Button>}
      renderEvent={(lesson) => (
        <span className="flex min-w-0 items-start gap-1.5">
          <Avatar size={20} name={lesson.student} color="auto" />
          <span className="min-w-0"><span className="block truncate font-semibold">{lesson.student}</span>
            <span className="block truncate text-(--ui-muted)">{lesson.subject}</span></span>
        </span>
      )} />
  )
}
