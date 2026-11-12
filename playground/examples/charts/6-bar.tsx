/* Bar */
import { BarChart } from '@milktop/react-ui'
import { months, pounds } from './months'

export default function Example() {
  return <BarChart data={months} x="month" y="revenue" format={pounds} label="Revenue by month" />
}
