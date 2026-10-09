/* Creating
  `onCreate` offers "Create …" for text that matches nothing, and hands you the text. Return the new item to select it (or a promise of it, after saving); `renderCreate` changes the option's content. */
import { useState } from 'react'
import { Select } from '@milktop/react-ui'

type Room = { id: number, name: string }

export default function Example() {
  const [topics, setTopics] = useState(['Algebra', 'Geometry', 'Statistics'])
  const [picked, setPicked] = useState(['Algebra'])
  const [rooms, setRooms] = useState<Room[]>([{ id: 1, name: 'Library' }, { id: 2, name: 'Lab' }])
  const [roomId, setRoomId] = useState<number | null>(null)

  // Add it to the list and return it, so it's picked too.
  function addTopic(name: string) {
    setTopics((topics) => [...topics, name])
    return name
  }

  // Stands in for saving it: POST /rooms, then the saved room.
  async function saveRoom(name: string) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const room = { id: rooms.length + 1, name }
    setRooms((rooms) => [...rooms, room])
    return room
  }

  return <>
    <Select label="Topics" items={topics} multiple onCreate={addTopic} value={picked} onValueChange={setPicked} placeholder="Add a topic…" />
    <Select label="Room" items={rooms} labelKey="name" valueKey="id" onCreate={saveRoom} value={roomId} onValueChange={setRoomId}
      renderCreate={(query) => <><span className="text-(--ui-muted)">Add room</span> <b>{query}</b></>} />
    <p>{JSON.stringify(picked)}, room {roomId ?? '—'} of {rooms.length}</p>
  </>
}
