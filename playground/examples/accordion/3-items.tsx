/* From items
  `items`: `{ value, heading, content }`, uncontrolled with `defaultValue`. */
import { Accordion } from '@milktop/react-ui'

const faq = [
  { value: 1, heading: 'Where are lessons?', content: 'At your home, at ours, or online.' },
  { value: 2, heading: 'What do I need?', content: 'A pencil, a calculator and last week’s homework.' },
]

export default function Example() {
  return <Accordion items={faq} defaultValue={1} />
}
