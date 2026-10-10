/* One at a time
  Click the open item to close it again; the last item is disabled. */
import { useState } from 'react'
import { Accordion } from '@milktop/react-ui'

export default function Example() {
  const [faq, setFaq] = useState<string | string[] | null>('pricing')
  return <>
    <Accordion value={faq} onValueChange={setFaq}>
      <Accordion.Item value="pricing" heading="How much are lessons?">Lessons are £40 an hour, or £35 when you book a block of ten.</Accordion.Item>
      <Accordion.Item value="cancel" heading="Can I cancel a lesson?">Yes, free of charge up to 24 hours before it starts.</Accordion.Item>
      <Accordion.Item value="online" heading="Do you teach online?">Most tutors teach both online and in person; check their profile.</Accordion.Item>
      <Accordion.Item value="exams" heading="Exam preparation" disabled>Available from January.</Accordion.Item>
    </Accordion>
    <p className="m-0 w-full text-sm text-(--ui-muted)">faq: {JSON.stringify(faq)}</p>
  </>
}
