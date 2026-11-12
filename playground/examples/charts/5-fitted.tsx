/* Fitted to the values, placed by date */
import { AreaChart } from '@milktop/react-ui'

const weights = [
  { date: '2024-01-10', kg: 4.21 }, { date: '2024-01-24', kg: 4.18 }, { date: '2024-06-03', kg: 4.05 },
  { date: '2024-11-20', kg: 3.98 }, { date: '2025-02-14', kg: 3.94 }, { date: '2025-09-01', kg: 3.9 },
]

export default function Example() {
  return <AreaChart data={weights} x="date" y="kg" time zero={false} format={(kg) => `${kg.toFixed(2)} kg`} height={200} label="A cat's weight, losing a little" />
}
