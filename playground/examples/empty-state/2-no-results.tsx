/* No results */
import { EmptyState, Button } from '@milktop/react-ui'

export default function Example() {
  return (
    <EmptyState icon="lucide:search-x" heading="No students match “zz”" description="Check the spelling or clear the filters.">
      <Button size="sm" variant="ghost">Clear filters</Button>
    </EmptyState>
  )
}
