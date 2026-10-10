/* Student profile
  A header with the student's details and actions, then tabs: an overview of details and history, upcoming lessons, their files and your notes. */
import { useState } from 'react'
import {
  Avatar, Badge, Button, Breadcrumbs, Menu, Tabs, Tab, Card, DataList, Timeline, Table, Attachments, Editor, Stats, Stat, Progress,
  toaster, type Attachment,
} from '@milktop/react-ui'
import { activity } from '../data'

const photo = (seed: string) => ({ thumb: `https://picsum.photos/seed/${seed}/400/300`, url: `https://picsum.photos/seed/${seed}/1200/900` })

const lessons = [
  { id: 1, when: 'Thu 9 Oct, 16:00', topic: 'Fractions to decimals', length: '60 min', status: 'Booked' },
  { id: 2, when: 'Thu 16 Oct, 16:00', topic: 'Percentages', length: '60 min', status: 'Booked' },
  { id: 3, when: 'Thu 23 Oct, 16:00', topic: 'Mock exam review', length: '90 min', status: 'Pending' },
]

export default function Profile() {
  const [files, setFiles] = useState<Attachment[]>([
    { name: 'Worksheet 4.pdf', size: 482000, type: 'application/pdf' },
    { name: 'Homework photo.jpg', size: 910000, type: 'image/jpeg', ...photo('profile-homework') },
    { name: 'Mock results.xlsx', size: 48000 },
  ])
  const [notes, setNotes] = useState('<p>Confident with <strong>equivalent fractions</strong> now. Next: percentages, then a timed mock.</p>')

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: 'Students', href: '#/blocks/students' }, { label: 'Ada Lovelace' }]} />
      <div className="flex flex-wrap items-center gap-4">
        <Avatar size="xl" name="Ada Lovelace" src="https://i.pravatar.cc/160?img=47" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 text-xl font-bold">Ada Lovelace</h2>
            <Badge variant="success" dot>Active</Badge>
          </div>
          <p className="mt-1 mb-0 text-sm text-(--ui-muted)">GCSE Maths · Year 11 · Thursdays at 16:00</p>
        </div>
        <div className="flex gap-2">
          <Button icon="lucide:message-square">Message</Button>
          <Button variant="primary" icon="lucide:calendar-plus">Book lesson</Button>
          <Menu placement="bottom-end" onSelect={(v) => toaster.info({ title: String(v) })}
            items={[{ label: 'Edit details', icon: 'lucide:pencil' }, { label: 'Send invoice', icon: 'lucide:receipt' },
              { separator: true }, { label: 'Archive', icon: 'lucide:archive', danger: true }]}
            trigger={<Button icon="lucide:ellipsis" aria-label="More actions" />} />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <Tab value="overview" label="Overview" icon="lucide:layout-grid">
          <div className="flex flex-wrap items-start gap-6 pt-4">
            <div className="flex min-w-0 flex-[2_1_24rem] flex-col gap-6">
              <Stats variant="divided" columns={3}>
                <Stat label="Lessons" value={24} change={4} changeUnit="" changeLabel="this term" />
                <Stat label="Attendance" value="92" unit="%" />
                <Stat label="Owed" value="£0" />
              </Stats>
              <Card heading="Progress to target" description="Grade 7 in the summer exam">
                <div className="flex flex-col gap-4">
                  <Progress value={70} label="Number" showValue />
                  <Progress value={45} label="Algebra" showValue />
                  <Progress value={60} label="Geometry" showValue />
                </div>
              </Card>
              <Card heading="Details">
                <DataList variant="divided" labelWidth="8rem" items={[
                  { label: 'Email', value: 'ada.lovelace@example.com' },
                  { label: 'Parent', value: 'Anne Byron, anne@example.com' },
                  { label: 'Rate', value: '£40 an hour', info: 'Billed monthly' },
                  { label: 'Started', value: 'September 2025' },
                ]} />
              </Card>
            </div>
            <Card heading="History" className="min-w-0 flex-[1_1_16rem]"><Timeline size="sm" items={activity} /></Card>
          </div>
        </Tab>
        <Tab value="lessons" label="Lessons" count={lessons.length}>
          <div className="pt-4">
            <Table rows={lessons} columns={[
              { key: 'when', label: 'When' }, { key: 'topic', label: 'Topic' }, { key: 'length', label: 'Length', align: 'end' },
              { key: 'status', label: '', align: 'end', cell: ({ row }) => <Badge variant={row.status === 'Booked' ? 'success' : 'warning'}>{row.status}</Badge> },
            ]} />
          </div>
        </Tab>
        <Tab value="files" label="Files" count={files.length}>
          <div className="pt-4"><Attachments items={files} onItemsChange={setFiles} removable addable /></div>
        </Tab>
        <Tab value="notes" label="Notes">
          <div className="pt-4"><Editor value={notes} onValueChange={setNotes} placeholder="Notes for the next lesson…" /></div>
        </Tab>
      </Tabs>
    </div>
  )
}
