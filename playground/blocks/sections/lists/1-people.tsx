/* People, with a menu each
  A card list: avatar, name and a line, a status and a row menu. The whole row is a link; the menu stays clickable. */
import { Card, Avatar, Badge, Menu, Button, toaster } from '@milktop/react-ui'
import { students, statusTone } from '../../data'

export default function People() {
  return (
    <Card heading="Students" description="Sorted by next lesson" flush>
      <ul className="m-0 list-none p-0">
        {students.slice(0, 5).map((s) => (
          <li key={s.id} className="relative flex items-center gap-3 border-t border-(--ui-border) px-5 py-3 hover:bg-(--ui-hover)">
            <Avatar name={s.name} color="auto" />
            <a href="#/blocks/lists" className="min-w-0 flex-1 text-(--ui-text) no-underline after:absolute after:inset-0">
              <div className="truncate text-sm font-medium">{s.name}</div>
              <div className="truncate text-xs text-(--ui-muted)">{s.subject} · Year {s.year}</div>
            </a>
            <Badge variant={statusTone[s.status]} dot>{s.status}</Badge>
            <span className="relative">
              <Menu placement="bottom-end" onSelect={(v) => toaster.info({ title: `${String(v)}: ${s.name}` })}
                items={[{ label: 'Message', icon: 'lucide:message-square' }, { label: 'Book lesson', icon: 'lucide:calendar-plus' }]}
                trigger={<Button size="sm" variant="ghost" icon="lucide:ellipsis" aria-label={`Actions for ${s.name}`} />} />
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
