/* As functions
  For strings: chart formats, aria-labels, toasts. `formatNumber`, `formatBytes` and `formatRelative` keep their Intl formatters, so they're cheap in lists. */
import { formatNumber, formatBytes, formatRelative, Button, toaster } from '@milktop/react-ui'

export default function Example() {
  const total = 1820
  return <>
    <Button icon="lucide:receipt" onClick={() => toaster.success({
      title: `Invoice sent: ${formatNumber(total, { style: 'currency', currency: 'GBP' })}`,
      description: `${formatBytes(48200)} PDF, ${formatRelative(new Date(Date.now() - 90000))}`,
    })}>Send an invoice</Button>
    <code className="text-xs text-(--ui-muted)">formatNumber(1820, {'{'} style: 'currency', currency: 'GBP' {'}'}) → {formatNumber(1820, { style: 'currency', currency: 'GBP' })}</code>
  </>
}
