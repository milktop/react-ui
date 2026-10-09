/* Shapes */
import { Skeleton } from '@milktop/react-ui'

export default function Example() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Skeleton height="120px" />
      <Skeleton lines={3} />
      <div className="flex gap-3">
        <Skeleton width="80px" height="28px" />
        <Skeleton width="120px" height="28px" />
      </div>
    </div>
  )
}
