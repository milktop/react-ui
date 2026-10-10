import type { TableColumn } from '@milktop/react-ui'
import type { Student } from './students'

export const columns: TableColumn<Student>[] = [
  { key: 'name', label: 'Student', sortable: true },
  { key: 'subject', label: 'Subject' },
  { key: 'lessons', label: 'Lessons', align: 'end', sortable: true },
]
