/* Loading a profile
  Mark the region `aria-busy` while it loads. */
import { useState } from 'react'
import { Skeleton, Button } from '@milktop/react-ui'

export default function Example() {
  const [loading, setLoading] = useState(true)
  return <>
    <div className="flex w-full max-w-sm items-center gap-3" aria-busy={loading}>
      {loading ? <>
        <Skeleton circle width="40px" height="40px" />
        <Skeleton lines={2} className="flex-1" />
      </> : <>
        <span className="grid size-10 place-items-center rounded-full bg-(--ui-accent-soft) text-sm font-semibold text-(--ui-accent-soft-text)">AL</span>
        <div>
          <strong>Ada Lovelace</strong>
          <div className="text-sm text-(--ui-muted)">Maths tutor, 12 years</div>
        </div>
      </>}
    </div>
    <Button size="sm" onClick={() => setLoading(!loading)}>{loading ? 'Finish loading' : 'Load again'}</Button>
  </>
}
