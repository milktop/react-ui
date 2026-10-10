/* Icons and separators */
import { Breadcrumbs } from '@milktop/react-ui'
import { lesson } from './lesson'

export default function Example() {
  return (
    <div className="flex w-full flex-col gap-3">
      <Breadcrumbs items={lesson.slice(0, 3)} />
      <Breadcrumbs separator="/" items={lesson.slice(0, 3)} />
      <Breadcrumbs separator="·" items={lesson.slice(1, 4)} />
    </div>
  )
}
