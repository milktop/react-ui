// Made-up data shared by the blocks.
const first = ['Ada', 'Alan', 'Grace', 'Katherine', 'Margaret', 'Tim', 'Edsger', 'Barbara', 'Donald', 'Radia', 'Frances', 'John']
const last = ['Lovelace', 'Turing', 'Hopper', 'Johnson', 'Hamilton', 'Berners-Lee', 'Dijkstra', 'Liskov', 'Knuth', 'Perlman', 'Allen', 'McCarthy']
export const subjectNames = ['Maths', 'English', 'Physics', 'Chemistry']
const statuses = ['Active', 'Active', 'Active', 'Paused', 'New'] as const

export type Student = {
  id: number, name: string, email: string, year: number, subject: string, status: typeof statuses[number], lessons: number, owed: number,
}

export const students: Student[] = Array.from({ length: 30 }, (_, i) => {
  const name = `${first[i % 12]} ${last[(i * 5 + Math.floor(i / 12)) % 12]}`
  const [given, family] = name.toLowerCase().split(' ')
  return {
    id: i + 1, name, email: `${given}.${family}@example.com`, year: 7 + ((i * 3) % 7), subject: subjectNames[i % 4],
    status: statuses[i % 5], lessons: (i * 13) % 40, owed: i % 4 === 1 ? 40 + (i % 3) * 20 : 0,
  }
})

export const statusTone = { Active: 'success', Paused: 'warning', New: 'accent' } as const

export const today = [
  { id: 1, student: 'Ada Lovelace', subject: 'Maths', time: '16:00', length: '60 min', where: 'Online' },
  { id: 2, student: 'Alan Turing', subject: 'Physics', time: '17:30', length: '45 min', where: 'At home' },
  { id: 3, student: 'Grace Hopper', subject: 'English', time: '19:00', length: '60 min', where: 'Online' },
]

export const activity = [
  { title: 'Invoice paid by Alan Turing', time: '2h ago', color: 'success' as const, icon: 'lucide:receipt', description: '£140 for September' },
  { title: 'Lesson booked with Grace Hopper', time: '5h ago', color: 'accent' as const, icon: 'lucide:calendar-plus' },
  { title: 'Ada Lovelace cancelled', time: 'Yesterday', color: 'danger' as const, icon: 'lucide:calendar-x', description: 'Rescheduled for Thursday' },
  { title: 'New student: Radia Perlman', time: '2 days ago', icon: 'lucide:user-plus' },
]

export const revenue = [
  { month: 'Apr', paid: 1240, owed: 120 },
  { month: 'May', paid: 1480, owed: 90 },
  { month: 'Jun', paid: 1310, owed: 160 },
  { month: 'Jul', paid: 860, owed: 40 },
  { month: 'Aug', paid: 720, owed: 60 },
  { month: 'Sep', paid: 1650, owed: 210 },
  { month: 'Oct', paid: 1820, owed: 320 },
]

export const pounds = (v: number) => `£${v.toLocaleString()}`
