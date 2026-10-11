/* Numbers
  `FormatNumber` takes Intl.NumberFormat's options as props; the raw number stays in a <data> element. */
import { FormatNumber, DataList } from '@milktop/react-ui'

export default function Example() {
  return (
    <DataList className="w-full max-w-md" labelWidth="9rem" items={[
      { label: 'Plain', value: <FormatNumber value={1820.5} /> },
      { label: 'Currency', value: <FormatNumber value={1820} style="currency" currency="GBP" /> },
      { label: 'No pence', value: <FormatNumber value={1820} style="currency" currency="GBP" maximumFractionDigits={0} /> },
      { label: 'Percent', value: <FormatNumber value={0.125} style="percent" /> },
      { label: 'Unit', value: <FormatNumber value={48.5} style="unit" unit="hour" unitDisplay="long" /> },
      { label: 'Compact', value: <FormatNumber value={12400} notation="compact" /> },
      { label: 'Change', value: <FormatNumber value={0.069} style="percent" signDisplay="always" maximumFractionDigits={1} /> },
    ]} />
  )
}
