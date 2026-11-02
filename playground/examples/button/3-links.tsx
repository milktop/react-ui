/* Links
  With `href` it's an <a>, in any variant; `link` takes your router's link instead. Disabled or loading, it stays a <button>. */
import { Button } from '@milktop/react-ui'

export default function Example() {
  return <>
    <Button variant="primary" icon="lucide:plus" href="#new">New student</Button>
    <Button href="#students" iconEnd="lucide:arrow-right">Students</Button>
    <Button href="#archived" disabled>Archived</Button>
    <p>Taught by <Button variant="link" href="#ada">Ada Lovelace</Button> on Mondays.</p>
  </>
}
