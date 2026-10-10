/* With actions */
import { Banner, Button } from '@milktop/react-ui'

export default function Example() {
  return (
    <Banner variant="warning" icon="lucide:credit-card"
      actions={<><Button size="sm" variant="ghost">Later</Button><Button size="sm">Choose a plan</Button></>}>
      Your trial ends in 3 days.
    </Banner>
  )
}
