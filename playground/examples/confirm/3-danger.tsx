/* Can't be undone
  `danger` makes the button red; `typeToConfirm` keeps it disabled until the name is typed (Enter confirms then). */
import { confirm, Button, toaster } from '@milktop/react-ui'

export default function Example() {
  async function remove() {
    const deleted = await confirm({
      heading: 'Delete Ada Lovelace?', description: 'Her lessons, invoices and notes go too. This can’t be undone.',
      danger: true, confirmLabel: 'Delete', typeToConfirm: 'Ada Lovelace',
    })
    toaster.create({ type: deleted ? 'error' : 'info', title: deleted ? 'Ada Lovelace deleted' : 'Kept Ada Lovelace' })
  }
  return <Button variant="danger" icon="lucide:trash-2" onClick={remove}>Delete student</Button>
}
