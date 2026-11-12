/* Fitted to the values */
import { AreaChart } from '@milktop/react-ui'

const weights = [4.21, 4.18, 4.05, 3.98, 3.94, 3.9].map((kg, i) => ({ label: `S${i + 1}`, kg }))

export default function Example() {
  return <AreaChart data={weights} y="kg" zero={false} format={(kg) => `${kg.toFixed(2)} kg`} height={200} label="A cat's weight, losing a little" />
}
