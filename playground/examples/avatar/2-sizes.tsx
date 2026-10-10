/* Sizes
  Named sizes, or any CSS length (a number is pixels). */
import { Avatar } from '@milktop/react-ui'

export default function Example() {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-3">
        {(['sm', 'md', 'lg', 'xl'] as const).map((size) => <Avatar key={size} size={size} name="Ada Lovelace" />)}
      </div>
      <div className="flex items-center gap-3">
        {[24, 32, 48, 96].map((size) => <Avatar key={size} size={size} name="Ada Lovelace" />)}
      </div>
    </div>
  )
}
