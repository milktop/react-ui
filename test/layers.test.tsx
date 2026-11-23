import type { ReactNode } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog } from '../src/dialog/Dialog.js'
import { Sheet } from '../src/sheet/Sheet.js'
import { Popover } from '../src/popover/Popover.js'
import { Menu } from '../src/menu/Menu.js'
import { Select } from '../src/select/Select.js'
import { DatePicker } from '../src/date-picker/DatePicker.js'
import { Tooltip } from '../src/tooltip/Tooltip.js'

// jsdom has none; the positioners want one.
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} }
// Nor this; Zag scrolls an opened list to its pick.
Element.prototype.scrollTo ??= () => {}

afterEach(cleanup)

const frame = () => act(() => new Promise((resolve) => requestAnimationFrame(resolve)))
const sheets = import.meta.glob<string>('../src/**/*.css', { query: '?raw', import: 'default', eager: true })
const css = (file: string) => sheets[`../src/${file}`].replace(/\s+/g, ' ')
const zOf = (text: string, selector: string) => text.match(new RegExp(`${selector.replace(/[[\]]/g, '\\$&')} \\{[^}]*?z-index: ([^;]+);`))?.[1]

// Page 50, dialogs and sheets 100, what opens from them 105, tooltips 110; each open layer one more (Zag's
// --layer-index), so one opened from another sits above it whichever portal came first in the page.
const popups = [['select/select.css', 'select'], ['select/search-select.css', 'combobox'], ['date-picker/date-picker.css', 'date-picker'],
  ['menu/menu.css', 'menu'], ['popover/popover.css', 'popover']]

test.each(popups)('%s: its list counts the layers under it', (file, scope) => {
  const text = css(file)
  expect(zOf(text, `[data-scope=${scope}][data-part=content]`)).toBe('calc(50 + var(--layer-index, 0))')
  expect(zOf(text, `[data-scope=${scope}][data-part=content][data-layered]`)).toBe('calc(105 + var(--layer-index, 0))')
  expect(zOf(text, `[data-scope=${scope}][data-part=positioner][data-layered]`)).toBe('105')
})

// 100 at index 0; at 1 or more (a confirm from a popover in a dialog), 105 + index, as the popups.
const stacked = 'calc(100 + var(--layer-index, 0) + 5 * min(1, var(--layer-index, 0)))'

test('dialogs and sheets sit at 100, or above the layer they open over; tooltips above them', () => {
  for (const [file, scope] of [['dialog/dialog.css', 'dialog'], ['sheet/sheet.css', 'sheet']]) {
    expect(zOf(css(file), `[data-scope=${scope}][data-part=positioner]`)).toBe(stacked)
    expect(zOf(css(file), `[data-scope=${scope}][data-part=backdrop]`)).toBe(stacked)
  }
  expect(Number(zOf(css('tooltip/tooltip.css'), '[data-scope=tooltip][data-part=positioner]'))).toBeGreaterThan(105)
})

const fruits = [{ value: 'apple', label: 'Apple' }, { value: 'pear', label: 'Pear' }]
const inners = (): [string, string, ReactNode][] => [
  ['Select', 'select', <Select label="Fruit" items={fruits} />],
  ['searchable Select', 'combobox', <Select label="Fruit" searchable items={fruits} />],
  ['DatePicker', 'date-picker', <DatePicker label="Day" />],
  ['Menu', 'menu', <Menu trigger={<button>Actions</button>} items={fruits} />],
  ['Popover', 'popover', <Popover trigger={<button>More</button>}>Inside</Popover>],
]

test.each(inners())('%s: layered inside a Dialog or Sheet, not on the page', (_, scope, inner) => {
  const layered = () => [...document.querySelectorAll(`[data-scope=${scope}]:is([data-part=positioner], [data-part=content])`)]
    .map((el) => el.hasAttribute('data-layered'))
  const { unmount } = render(<>{inner}</>)
  expect(layered().every((on) => !on)).toBe(true)
  unmount()
  for (const Layer of [Dialog, Sheet]) {
    const { unmount } = render(<Layer defaultOpen heading="Layer">{inner}</Layer>)
    expect(layered().length).toBeGreaterThan(0)
    expect(layered().every(Boolean)).toBe(true)
    unmount()
  }
})

test('Escape closes a tooltip before the dialog under it', async () => {
  const onOpenChange = vi.fn()
  const user = userEvent.setup()
  render(
    <Dialog defaultOpen onOpenChange={onOpenChange} heading="Layer">
      <Tooltip defaultOpen content="Saves a draft"><button>Save</button></Tooltip>
    </Dialog>,
  )
  await frame()
  expect(screen.getByText('Saves a draft')).toBeTruthy()
  await user.keyboard('{Escape}')
  await frame()
  expect(screen.queryByText('Saves a draft')).toBeNull()
  expect(onOpenChange).not.toHaveBeenCalled()
  await user.keyboard('{Escape}')
  await frame()
  expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
})

test('Escape closes a select, then the popover it is in, then the dialog', async () => {
  const dialog = vi.fn()
  const popover = vi.fn()
  const user = userEvent.setup()
  render(
    <Dialog defaultOpen onOpenChange={dialog} heading="Layer">
      <Popover onOpenChange={popover} trigger={<button>Filters</button>}>
        <Select label="Fruit" items={fruits} />
      </Popover>
    </Dialog>,
  )
  await frame()
  await user.click(screen.getByText('Filters'))
  await frame()
  popover.mockClear()
  await user.click(document.querySelector('[data-scope=select][data-part=trigger]')!)
  await frame()
  const list = document.querySelector('[data-scope=select][data-part=content]')!
  expect(list.getAttribute('data-state')).toBe('open')
  await user.keyboard('{Escape}')
  await frame()
  expect(list.getAttribute('data-state')).toBe('closed')
  expect(popover).not.toHaveBeenCalled()
  await user.keyboard('{Escape}')
  await frame()
  expect(popover).toHaveBeenCalledWith(false, expect.anything())
  expect(dialog).not.toHaveBeenCalled()
  await user.keyboard('{Escape}')
  await frame()
  expect(dialog).toHaveBeenCalledWith(false, expect.anything())
})

test('a sheet that is not modal gives focus back when it closes', async () => {
  const user = userEvent.setup()
  render(<Sheet modal={false} heading="Filters" trigger={<button>Filters</button>}><input aria-label="Name" /></Sheet>)
  await user.click(screen.getByText('Filters'))
  await frame()
  await user.click(screen.getByLabelText('Name'))
  await user.keyboard('{Escape}')
  await frame()
  expect(document.activeElement).toBe(screen.getByText('Filters'))
})
