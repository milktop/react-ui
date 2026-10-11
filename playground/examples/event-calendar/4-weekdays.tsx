/* Weekdays, your own content
  `view="workweek"` and the hours you teach; `renderEvent` draws each lesson (an avatar and the subject); `actions` sit in the toolbar. Without `onEventChange` or `onSelect` it's read only. */
import { EventCalendar, Avatar, Button } from '@milktop/react-ui'
import { lessons } from './lessons'

export default function Example() {
  return (
    <EventCalendar events={lessons.filter((l) => !l.allDay)} defaultView="workweek" views={[]} startHour={9} endHour={19}
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
