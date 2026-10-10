/* Cards with sparklines
  Each Stat takes content under it: here a Sparkline of the last seven months. */
import { Stats, Stat, Sparkline } from '@milktop/react-ui'

export default function StatsBlock() {
  return (
    <Stats variant="cards" columns={3}>
      <Stat label="Revenue" value="£1,820" change={10.3} changeLabel="vs September"><Sparkline data={[1240, 1480, 1310, 860, 720, 1650, 1820]} variant="area" className="mt-3" /></Stat>
      <Stat label="Lessons" value={52} change={12.5}><Sparkline data={[38, 44, 41, 28, 22, 46, 52]} variant="bar" className="mt-3" /></Stat>
      <Stat label="Cancellations" value={3} change={-40} invert><Sparkline data={[6, 4, 5, 2, 1, 5, 3]} color="danger" className="mt-3" /></Stat>
    </Stats>
  )
}
