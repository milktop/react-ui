// The blocks: composed examples of common app screens. Pages are one file
// each (blocks/pages/<n>-<slug>.tsx); a sections page shows every file in
// blocks/sections/<slug>/, like a component's examples.
import type { ComponentType } from 'react'

const modules = import.meta.glob<{ default: ComponentType }>('./**/*.tsx', { eager: true })
const raws = import.meta.glob<string>('./**/*.tsx', { query: '?raw', import: 'default', eager: true })

const sections = [
  { slug: 'headings', title: 'Page headings', icon: 'lucide:heading', about: 'Titles with actions, breadcrumbs and meta' },
  { slug: 'stats', title: 'Stats', icon: 'lucide:chart-no-axes-column', about: 'Numbers with trends and charts' },
  { slug: 'lists', title: 'Stacked lists', icon: 'lucide:rows-3', about: 'People and lessons in rows, with actions' },
  { slug: 'forms', title: 'Form layouts', icon: 'lucide:square-pen', about: 'Card forms, settings sections, a danger zone' },
  { slug: 'empty-states', title: 'Empty states', icon: 'lucide:inbox', about: 'First run and no results' },
]

const pageInfo: Record<string, { icon: string, about: string }> = {
  dashboard: { icon: 'lucide:layout-dashboard', about: 'Stats, revenue, today\'s lessons and activity' },
  students: { icon: 'lucide:users', about: 'Filters, a selectable table and a detail sheet' },
  profile: { icon: 'lucide:id-card', about: 'A student: header, tabs, files and notes' },
  inbox: { icon: 'lucide:messages-square', about: 'Conversations, a thread and a rich text reply' },
  settings: { icon: 'lucide:settings', about: 'Form sections with an unsaved-changes bar' },
  'sign-in': { icon: 'lucide:log-in', about: 'A centred sign-in card' },
}

export type BlockExample = { path: string, title: string, description: string, code: string, Component: ComponentType }

// A file's title and description come from its leading comment, as for examples.
function parse(path: string): BlockExample {
  const raw = raws[path]
  const comment = raw.match(/^\/\*\s*([\s\S]*?)\s*\*\/\n?/)
  const [title, ...rest] = (comment?.[1] ?? '').split('\n')
  return {
    path, title, Component: modules[path].default,
    description: rest.map((line) => line.trim()).join(' '),
    code: (comment ? raw.slice(comment[0].length) : raw).trim(),
  }
}

const pageFiles = Object.keys(modules).filter((path) => path.startsWith('./pages/')).sort()

export type Block = { slug: string, title: string, icon: string, about: string, group: 'Sections' | 'Pages' }
  & ({ kind: 'sections', examples: BlockExample[] } | { kind: 'page', page: BlockExample })

export const blocks: Block[] = [
  ...pageFiles.map((path) => {
    const slug = path.match(/\/\d+-([\w-]+)\.tsx$/)![1]
    const page = parse(path)
    return { slug, group: 'Pages' as const, kind: 'page' as const, title: page.title, ...pageInfo[slug], page }
  }),
  ...sections.map((section) => ({
    ...section, group: 'Sections' as const, kind: 'sections' as const,
    examples: Object.keys(modules).filter((path) => path.startsWith(`./sections/${section.slug}/`)).sort().map(parse),
  })).filter((block) => block.examples.length),
]
