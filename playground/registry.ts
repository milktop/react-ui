// The playground's pages, each naming the component file whose doc comment
// it shows; its examples are whatever is in examples/<slug>/ (sorted by file
// name), so nothing here needs updating when a component or example changes.

import type { ComponentType } from 'react'

const sources = import.meta.glob<string>('../src/**/*.tsx', { query: '?raw', import: 'default', eager: true })
const modules = import.meta.glob<{ default: ComponentType }>('./examples/**/*.tsx', { eager: true })
const raws = import.meta.glob<string>('./examples/**/*.tsx', { query: '?raw', import: 'default', eager: true })

export type Page = { slug: string, title: string, about: string, file: string, form?: boolean }
export type Group = { heading: string, icon: string, form?: boolean, pages: Page[] }
export type Example = ReturnType<typeof examplesOf>[number]

// Pages without examples yet are left out of the nav.
const all: Group[] = [
  { heading: 'Actions', icon: 'lucide:mouse-pointer-click', pages: [
    { slug: 'button', title: 'Button', about: 'Variants, sizes, icons, loading and counts', file: 'button/Button.tsx' },
    { slug: 'copy-button', title: 'Copy button', about: 'Copy text with feedback', file: 'copy-button/CopyButton.tsx' },
  ] },
  { heading: 'Display', icon: 'lucide:layout-grid', pages: [
    { slug: 'avatar', title: 'Avatar', about: 'Images with initials fallback, and stacks', file: 'avatar/Avatar.tsx' },
    { slug: 'badge', title: 'Badge', about: 'Statuses and counts', file: 'badge/Badge.tsx' },
    { slug: 'card', title: 'Card', about: 'A surface with a header and footer', file: 'card/Card.tsx' },
    { slug: 'table', title: 'Table', about: 'Sorting, selection, loading and custom cells', file: 'table/Table.tsx' },
    { slug: 'pagination', title: 'Pagination', about: 'Pages, with a summary', file: 'pagination/Pagination.tsx' },
    { slug: 'data-list', title: 'Data list', about: 'Labels and values', file: 'data-list/DataList.tsx' },
    { slug: 'stat', title: 'Stat', about: 'Headline numbers, with change', file: 'stat/Stat.tsx' },
    { slug: 'charts', title: 'Charts', about: 'Area, bar and sparklines', file: 'chart/AreaChart.tsx' },
    { slug: 'timeline', title: 'Timeline', about: 'Events down a line', file: 'timeline/Timeline.tsx' },
  ] },
  { heading: 'Feedback', icon: 'lucide:bell', pages: [
    { slug: 'alert', title: 'Alert', about: 'Messages in the page', file: 'alert/Alert.tsx' },
    { slug: 'banner', title: 'Banner', about: 'Announcements across the page', file: 'banner/Banner.tsx' },
    { slug: 'progress', title: 'Progress', about: 'Bars and circles', file: 'progress/Progress.tsx' },
    { slug: 'skeleton', title: 'Skeleton', about: 'Loading placeholders', file: 'skeleton/Skeleton.tsx' },
    { slug: 'spinner', title: 'Spinner', about: 'Short waits', file: 'spinner/Spinner.tsx' },
    { slug: 'empty-state', title: 'Empty state', about: 'Nothing here yet', file: 'empty-state/EmptyState.tsx' },
  ] },
  { heading: 'Inputs', form: true, icon: 'lucide:text-cursor-input', pages: [
    { slug: 'input', title: 'Input', about: 'Text and numbers, with icons and affixes', file: 'input/Input.tsx' },
    { slug: 'password-input', title: 'Password input', about: 'Show or hide what was typed', file: 'password-input/PasswordInput.tsx' },
    { slug: 'number-input', title: 'Number input', about: 'Step buttons, arrow keys, limits and formatting', file: 'number-input/NumberInput.tsx' },
    { slug: 'editor', form: false, title: 'Editor', about: 'Rich text, on TipTap', file: 'editor/Editor.tsx' },
    { slug: 'textarea', title: 'Textarea', about: 'Grows with its content', file: 'textarea/Textarea.tsx' },
    { slug: 'tags-input', title: 'Tags input', about: 'Type, press Enter, get a tag', file: 'tags-input/TagsInput.tsx' },
    { slug: 'pin-input', title: 'Pin input', about: 'One box per character, for codes', file: 'pin-input/PinInput.tsx' },
    { slug: 'slider', title: 'Slider', about: 'A number or a range', file: 'slider/Slider.tsx' },
    { slug: 'attachments', form: false, title: 'Attachments', about: 'Files as tiles or a list, with previews', file: 'attachments/Attachments.tsx' },
    { slug: 'file-upload', form: false, title: 'File upload', about: 'Drop or browse, with previews', file: 'file-upload/FileUpload.tsx' },
  ] },
  { heading: 'Pickers', form: true, icon: 'lucide:list-checks', pages: [
    { slug: 'select', title: 'Select', about: 'Pick one or several; search, load or create', file: 'select/Select.tsx' },
    { slug: 'date-picker', title: 'Date picker', about: 'Type a date or pick it from a calendar', file: 'date-picker/DatePicker.tsx' },
  ] },
  { heading: 'Choices', form: true, icon: 'lucide:circle-check', pages: [
    { slug: 'checkbox', title: 'Checkbox', about: 'On its own or in a group', file: 'checkbox/Checkbox.tsx' },
    { slug: 'radio-group', title: 'Radio group', about: 'Pick one, with descriptions', file: 'radio-group/RadioGroup.tsx' },
    { slug: 'switch', title: 'Switch', about: 'On or off', file: 'switch/Switch.tsx' },
    { slug: 'segment-group', title: 'Segmented', about: 'A row of options with a sliding indicator', file: 'segment-group/Segmented.tsx' },
    { slug: 'theme-toggle', title: 'Theme toggle', about: 'Light, dark or the OS setting', file: 'theme-toggle/ThemeToggle.tsx' },
  ] },
  { heading: 'Forms', icon: 'lucide:clipboard-list', pages: [
    { slug: 'field', title: 'Field', about: 'Labels, hints and errors, on a grid', file: 'field/Field.tsx' },
  ] },
  { heading: 'Navigation', icon: 'lucide:compass', pages: [
    { slug: 'app-shell', title: 'App shell', about: 'Sidebar, top bar and page, flat or inset', file: 'app-shell/AppShell.tsx' },
    { slug: 'sidebar', title: 'Sidebar', about: 'Sections, groups and items', file: 'sidebar/Sidebar.tsx' },
    { slug: 'page', title: 'Page', about: 'A heading, actions and content', file: 'page/Page.tsx' },
    { slug: 'breadcrumbs', title: 'Breadcrumbs', about: 'Where the page sits, with folding', file: 'breadcrumbs/Breadcrumbs.tsx' },
    { slug: 'command', title: 'Command menu', about: '⌘K search and actions', file: 'command/Command.tsx' },
  ] },
  { heading: 'Overlays', icon: 'lucide:layers', pages: [
    { slug: 'tooltip', title: 'Tooltip', about: 'Hints on hover and focus', file: 'tooltip/Tooltip.tsx' },
    { slug: 'popover', title: 'Popover', about: 'A panel that opens from a trigger', file: 'popover/Popover.tsx' },
    { slug: 'hover-card', title: 'Hover card', about: 'Previews on hover', file: 'hover-card/HoverCard.tsx' },
    { slug: 'dialog', title: 'Dialog', about: 'Modals and confirmations', file: 'dialog/Dialog.tsx' },
    { slug: 'sheet', title: 'Sheet', about: 'Panels that slide in from an edge', file: 'sheet/Sheet.tsx' },
    { slug: 'action-bar', title: 'Action bar', about: 'Actions for a selection', file: 'action-bar/ActionBar.tsx' },
    { slug: 'menu', title: 'Menu', about: 'Dropdowns and context menus', file: 'menu/Menu.tsx' },
    { slug: 'toast', title: 'Toast', about: 'Notifications', file: 'toast/Toaster.tsx' },
  ] },
  { heading: 'Disclosure', icon: 'lucide:chevrons-up-down', pages: [
    { slug: 'tabs', title: 'Tabs', about: 'Panels behind tabs, with counts', file: 'tabs/Tabs.tsx' },
    { slug: 'accordion', title: 'Accordion', about: 'Sections that expand', file: 'accordion/Accordion.tsx' },
    { slug: 'collapsible', title: 'Collapsible', about: 'Show more, animated', file: 'collapsible/Collapsible.tsx' },
  ] },
]

const hasExamples = (slug: string) => Object.keys(modules).some((path) => path.startsWith(`./examples/${slug}/`))
export const groups = all
  .map((group) => ({ ...group, pages: group.pages.filter((page) => hasExamples(page.slug)) }))
  .filter((group) => group.pages.length)

export const pages = groups.flatMap((group) => group.pages.map((page) => ({ ...page, group })))

// A component's doc comment (the first /** … */ block), without its stars.
export function docOf(file: string) {
  const block = (sources[`../src/${file}`] ?? '').match(/\/\*\*([\s\S]*?)\*\//)?.[1] ?? ''
  const lines = block.split('\n').map((line) => line.replace(/^\s*\* ?/, '')).join('\n').trim()
  return { summary: lines.split('\n\n')[0].replace(/\n/g, ' '), text: lines }
}

// An example's title and description come from its leading comment:
// /* Title
//    What it shows. */
export function examplesOf(slug: string) {
  return Object.keys(modules)
    .filter((path) => path.startsWith(`./examples/${slug}/`))
    .sort()
    .map((path) => {
      const raw = raws[path]
      const comment = raw.match(/^\/\*\s*([\s\S]*?)\s*\*\/\n?/)
      const [title, ...rest] = (comment?.[1] ?? '').split('\n')
      return {
        path,
        // `<n>-<name>.bare.tsx`: no card round it (it brings its own surface).
        bare: path.endsWith('.bare.tsx'),
        Component: modules[path].default,
        title,
        description: rest.map((line) => line.trim()).join(' '),
        code: (comment ? raw.slice(comment[0].length) : raw).trim(),
      }
    })
}
