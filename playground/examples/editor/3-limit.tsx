/* Fewer tools, with a limit */
import { Editor } from '@milktop/react-ui'

export default function Example() {
  return <Editor tools={['bold', 'italic', '|', 'bulletList', '|', 'link']} maxLength={280} minHeight="5rem" placeholder="Short feedback for the student…" />
}
