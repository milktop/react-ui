/* Showing what an Editor saved
  The same look as the Editor, so notes read the same where they're shown. Edit them and see. */
import { useState } from 'react'
import { Editor, Prose } from '@milktop/react-ui'

export default function Example() {
  const [notes, setNotes] = useState('<h2>Fractions and decimals</h2><p>Recap <strong>equivalent fractions</strong>, then convert between them. See <a href="#/prose">worksheet 4</a>.</p><ul><li><p>Halves, quarters and tenths</p></li><li><p>Ordering a mixed list</p></li></ul><blockquote><p>Ask about the mock exam.</p></blockquote>')
  return (
    <div className="grid w-full gap-6 md:grid-cols-2">
      <Editor value={notes} onValueChange={setNotes} tools={['bold', 'italic', '|', 'h2', 'bulletList', 'blockquote', 'link']} />
      <Prose html={notes} />
    </div>
  )
}
