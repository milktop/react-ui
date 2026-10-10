/* A lesson plan
  Drag a topic by its grip, or focus the grip and use Space and the arrow keys. The rows hold anything: here a time, a title and a badge. */
import { useState } from 'react'
import { SortableList, Badge } from '@milktop/react-ui'

const initial = [
  { id: 'recap', title: 'Recap: equivalent fractions', minutes: 10, kind: 'Review' },
  { id: 'teach', title: 'Converting fractions to decimals', minutes: 20, kind: 'New' },
  { id: 'practice', title: 'Worksheet 4, questions 1–8', minutes: 20, kind: 'Practice' },
  { id: 'quiz', title: 'Five-minute quiz', minutes: 5, kind: 'Check' },
  { id: 'homework', title: 'Set homework', minutes: 5, kind: 'Admin' },
]

export default function Example() {
  const [plan, setPlan] = useState(initial)
  return <>
    <SortableList items={plan} onItemsChange={setPlan} label="Lesson plan" className="w-full max-w-lg"
      renderItem={(step, { index }) => (
        <span className="flex items-center gap-3">
          <span className="w-6 text-xs text-(--ui-muted) tabular-nums">{index + 1}.</span>
          <span className="min-w-0 flex-1 truncate">{step.title}</span>
          <span className="text-xs text-(--ui-muted)">{step.minutes} min</span>
          <Badge variant={step.kind === 'New' ? 'accent' : 'neutral'}>{step.kind}</Badge>
        </span>
      )} />
    <p className="m-0 w-full text-sm text-(--ui-muted)">{plan.map((step) => step.id).join(' → ')}</p>
  </>
}
