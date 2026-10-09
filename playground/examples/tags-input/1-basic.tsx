/* Tags
  Enter or a comma adds one, Backspace removes the last, a double-click edits; pasting "a, b, c" adds three. `variant` sets their look. */
import { useState } from 'react'
import { TagsInput } from '@milktop/react-ui'

export default function Example() {
  const [topics, setTopics] = useState(['Algebra', 'Geometry'])
  return <>
    <TagsInput label="Topics" value={topics} onValueChange={setTopics} />
    <TagsInput label="Accent" variant="accent" defaultValue={['Physics', 'Chemistry']} />
    <p>{JSON.stringify(topics)}</p>
  </>
}
