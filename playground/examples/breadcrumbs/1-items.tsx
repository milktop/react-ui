/* From items
  The last item is the current page; items without a link show as plain text. */
import { Breadcrumbs } from '@milktop/react-ui'

export default function Example() {
  return <Breadcrumbs items={[{ label: 'Home', href: '#/' }, { label: 'Students', href: '#/breadcrumbs' }, { label: 'Ada Lovelace' }]} />
}
