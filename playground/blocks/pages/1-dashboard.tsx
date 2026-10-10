/* Dashboard
  A greeting with the main actions, stats with their trends, revenue over a range you pick, today's lessons beside recent activity. */
import { useState } from 'react'
import { Button, Stats, Stat, Sparkline, Card, Segmented, AreaChart, Avatar, Badge, Timeline, Banner, Menu, toaster } from '@milktop/react-ui'
import { today, activity, revenue, pounds } from '../data'

const ranges = [{ value: '3', label: '3m' }, { value: '7', label: '7m' }]

export default function Dashboard() {
  const [range, setRange] = useState('7')
  const shown = revenue.slice(-Number(range))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="m-0 text-xl font-bold">Good morning, Grace</h2>
          <p className="mt-1 mb-0 text-sm text-(--ui-muted)">You have {today.length} lessons today and 3 invoices to send.</p>
        </div>
        <div className="flex gap-2">
          <Button icon="lucide:receipt" onClick={() => toaster.success({ title: 'Invoices sent', description: '3 parents emailed' })}>Send invoices</Button>
          <Button variant="primary" icon="lucide:calendar-plus">Book lesson</Button>
        </div>
      </div>

      <Banner variant="soft" icon="lucide:sparkles" dismissible actions={<Button size="sm" variant="ghost">Try it</Button>}>
        New: share lesson notes with parents straight from a student's page.
      </Banner>

      <Stats variant="cards">
        <Stat icon="lucide:users" label="Active students" value={31} change={6.9} changeLabel="this month">
          <Sparkline data={[24, 26, 25, 27, 29, 30, 31]} className="mt-3" />
        </Stat>
        <Stat icon="lucide:calendar-check" label="Lessons" value={52} change={12.5} changeLabel="vs September">
          <Sparkline data={[38, 44, 41, 28, 22, 46, 52]} variant="bar" className="mt-3" />
        </Stat>
        <Stat icon="lucide:clock" label="Hours taught" value="48.5" unit="h" change={-2.1}>
          <Sparkline data={[46, 50, 49, 30, 26, 49, 48.5]} variant="area" className="mt-3" />
        </Stat>
        <Stat icon="lucide:wallet" label="Outstanding" value="£320" change={15} invert>
          <Sparkline data={revenue.map((r) => r.owed)} color="danger" className="mt-3" />
        </Stat>
      </Stats>

      <Card heading="Revenue" description="Paid and outstanding, by month"
        actions={<Segmented size="sm" items={ranges} value={range} onValueChange={(v) => v && setRange(v)} />}>
        <AreaChart data={shown} x="month" height={220} label="Revenue by month" format={pounds}
          series={[{ key: 'paid', label: 'Paid' }, { key: 'owed', label: 'Outstanding', color: 'var(--ui-chart-3)' }]} />
      </Card>

      {/* Side by side when there's room, stacked when not. */}
      <div className="flex flex-wrap items-start gap-6">
        <Card heading="Today" description="Thursday 9 October" className="min-w-0 flex-[2_1_26rem]" flush
          actions={<Button size="sm" variant="ghost" iconEnd="lucide:arrow-right">Calendar</Button>}>
          <ul className="m-0 list-none p-0">
            {today.map((lesson) => (
              <li key={lesson.id} className="flex items-center gap-3 border-t border-(--ui-border) px-5 py-3">
                <span className="w-12 shrink-0 text-sm font-semibold tabular-nums">{lesson.time}</span>
                <Avatar size="sm" name={lesson.student} color="auto" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{lesson.student}</div>
                  <div className="text-xs text-(--ui-muted)">{lesson.subject} · {lesson.length}</div>
                </div>
                <Badge variant={lesson.where === 'Online' ? 'accent' : 'neutral'}>{lesson.where}</Badge>
                <Menu placement="bottom-end" onSelect={(action) => toaster.info({ title: `${String(action)}: ${lesson.student}` })}
                  items={[{ label: 'Start lesson', icon: 'lucide:play' }, { label: 'Reschedule', icon: 'lucide:calendar-clock' },
                    { separator: true }, { label: 'Cancel', icon: 'lucide:x', danger: true }]}
                  trigger={<Button size="sm" variant="ghost" icon="lucide:ellipsis" aria-label={`Actions for ${lesson.student}`} />} />
              </li>
            ))}
          </ul>
        </Card>
        <Card heading="Recent activity" className="min-w-0 flex-[1_1_16rem]"><Timeline size="sm" items={activity} /></Card>
      </div>
    </div>
  )
}
