/* First run
  Nothing yet: say what goes here, and offer the first step (and a second way in). */
import { Card, EmptyState, Button } from '@milktop/react-ui'

export default function FirstRun() {
  return (
    <Card>
      <EmptyState icon="lucide:users" heading="Add your first student" description="Students hold their lessons, invoices and notes. Add one, or import a list.">
        <div className="flex gap-2"><Button icon="lucide:upload">Import CSV</Button><Button variant="primary" icon="lucide:user-plus">Add student</Button></div>
      </EmptyState>
    </Card>
  )
}
