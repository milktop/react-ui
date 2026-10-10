/* With icons
  `items`: objects with a Timeline.Item's props. */
import { Timeline } from '@milktop/react-ui'
import { history } from './history'

export default function Example() {
  return <Timeline items={history} />
}
