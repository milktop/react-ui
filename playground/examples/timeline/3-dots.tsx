/* Dots
  Without icons, small. */
import { Timeline } from '@milktop/react-ui'
import { history } from './history'

export default function Example() {
  return <Timeline size="sm" items={history.map((item) => ({ ...item, icon: null }))} />
}
