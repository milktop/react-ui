/* Bar */
import { useState } from 'react'
import { Progress, Button } from '@milktop/react-ui'

export default function Example() {
  const [value, setValue] = useState(40)
  const [uploading, setUploading] = useState(false)

  async function upload() {
    setUploading(true)
    for (let v = 0; v <= 100; v = Math.min(100, v + 7)) {
      setValue(v)
      if (v === 100) break
      await new Promise((resolve) => setTimeout(resolve, 120))
    }
    setUploading(false)
  }

  return <>
    <Progress label="Course completion" showValue value={value} />
    <div className="flex gap-2">
      <Button size="sm" onClick={() => setValue(Math.max(0, value - 10))}>−10</Button>
      <Button size="sm" onClick={() => setValue(Math.min(100, value + 10))}>+10</Button>
      <Button size="sm" onClick={upload} loading={uploading}>Simulate upload</Button>
    </div>
  </>
}
