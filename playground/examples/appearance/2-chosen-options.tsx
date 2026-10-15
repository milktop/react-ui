/* Chosen options
  `accents` and `sidebars` list what users may choose, the default first: a saved choice outside them moves to it (here, when the page opens). */
import { Appearance } from '@milktop/react-ui'

export default function Example() {
  return <Appearance accents={['teal', 'blue', 'violet', 'rose']} sidebars={['neutral', 'tint', 'dark']} />
}
