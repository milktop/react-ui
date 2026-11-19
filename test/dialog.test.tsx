import { useEffect, type ComponentType, type ReactNode } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog } from '../src/dialog/Dialog.js'
import { Sheet } from '../src/sheet/Sheet.js'

afterEach(cleanup)

// Zag moves focus in an animation frame.
const frame = () => act(() => new Promise((resolve) => requestAnimationFrame(resolve)))

type Layer = ComponentType<{ defaultOpen: boolean, onOpenChange: (open: boolean) => void, heading: string, children: ReactNode }>

async function open(Layer: Layer, field: ReactNode) {
  const onOpenChange = vi.fn()
  const user = userEvent.setup()
  render(<Layer defaultOpen onOpenChange={onOpenChange} heading="Note">{field}</Layer>)
  await frame()
  const escape = async () => { await user.keyboard('{Escape}'); await frame() }
  return { user, onOpenChange, escape }
}

// What an app does to keep an Escape for itself (closing its own menu): it runs before the layer's.
function KeepsEscape() {
  useEffect(() => {
    const keep = (event: KeyboardEvent) => event.key === 'Escape' && event.preventDefault()
    window.addEventListener('keydown', keep, { capture: true })
    return () => window.removeEventListener('keydown', keep, { capture: true })
  }, [])
  return <textarea aria-label="Kept" />
}

for (const [name, Layer] of [['Dialog', Dialog], ['Sheet', Sheet]] as [string, Layer][]) {
  test(`${name}: the first Escape leaves a textarea, the next closes`, async () => {
    const { user, onOpenChange, escape } = await open(Layer, <textarea aria-label="Text" />)
    const field = screen.getByLabelText('Text')
    await user.click(field)
    await escape()
    expect(document.activeElement).not.toBe(field)
    expect(onOpenChange).not.toHaveBeenCalled()
    await escape()
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
  })

  test(`${name}: an editable element steps back too`, async () => {
    const { user, onOpenChange, escape } = await open(Layer, <div contentEditable tabIndex={0} aria-label="Editor" />)
    const field = screen.getByLabelText('Editor')
    await user.click(field)
    expect(document.activeElement).toBe(field)
    await escape()
    expect(document.activeElement).not.toBe(field)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  test(`${name}: a single-line input closes at once`, async () => {
    const { user, onOpenChange, escape } = await open(Layer, <input aria-label="Name" />)
    await user.click(screen.getByLabelText('Name'))
    await escape()
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
  })

  test(`${name}: an Escape the app kept is left alone`, async () => {
    const { user, onOpenChange, escape } = await open(Layer, <KeepsEscape />)
    const field = screen.getByLabelText('Kept')
    await user.click(field)
    await escape()
    expect(document.activeElement).toBe(field)
    expect(onOpenChange).not.toHaveBeenCalled()
  })
}

test('a textarea beside a non-modal Sheet keeps closing it', async () => {
  const onOpenChange = vi.fn()
  const user = userEvent.setup()
  render(<>
    <textarea aria-label="Page" />
    <Sheet defaultOpen modal={false} onOpenChange={onOpenChange} heading="Note">…</Sheet>
  </>)
  await frame()
  await user.click(screen.getByLabelText('Page'))
  await user.keyboard('{Escape}')
  await frame()
  expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
})
