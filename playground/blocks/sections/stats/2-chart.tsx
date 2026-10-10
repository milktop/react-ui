/* Totals over a chart
  A divided row of totals in a card, with the chart they sum underneath, by subject. */
import { Card, Stats, Stat, BarChart } from '@milktop/react-ui'

const weeks = [
  { week: 'W36', maths: 12, english: 6, physics: 4 }, { week: 'W37', maths: 14, english: 7, physics: 5 },
  { week: 'W38', maths: 13, english: 8, physics: 3 }, { week: 'W39', maths: 15, english: 7, physics: 6 },
  { week: 'W40', maths: 16, english: 9, physics: 5 }, { week: 'W41', maths: 17, english: 8, physics: 6 },
]

export default function StatsBlock() {
  return (
    <Card heading="Lessons by subject" description="The last six weeks">
      <div className="flex flex-col gap-5">
        <Stats variant="divided" columns={3}>
          <Stat size="sm" label="Maths" value={87} change={8} />
          <Stat size="sm" label="English" value={45} change={3} />
          <Stat size="sm" label="Physics" value={29} change={-4} />
        </Stats>
        <BarChart data={weeks} x="week" stacked height={200} label="Lessons by subject per week"
          series={[{ key: 'maths', label: 'Maths' }, { key: 'english', label: 'English' }, { key: 'physics', label: 'Physics' }]} />
      </div>
    </Card>
  )
}
