/* A danger zone
  Destructive actions set apart, each confirmed in a dialog that asks for the name before it'll go ahead. */
import { useState } from 'react'
import { Card, Button, Dialog, Input, toaster } from '@milktop/react-ui'

export default function Danger() {
  const [typed, setTyped] = useState('')
  const [open, setOpen] = useState(false)
  return (
    <Card heading="Danger zone" className="border-(--ui-danger)/40">
      <div className="flex flex-col divide-y divide-(--ui-border)">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
          <div><div className="text-sm font-medium">Archive this student</div><div className="text-sm text-(--ui-muted)">They'll leave your lists; you can bring them back.</div></div>
          <Button>Archive</Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div><div className="text-sm font-medium">Delete this student</div><div className="text-sm text-(--ui-muted)">Their lessons, invoices and notes go too. This can't be undone.</div></div>
          <Dialog alert open={open} onOpenChange={(next) => { setOpen(next); setTyped('') }} heading="Delete Ada Lovelace?"
            description="Type her name to confirm." trigger={<Button variant="danger">Delete</Button>}
            footer={<>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="danger" disabled={typed !== 'Ada Lovelace'} onClick={() => { setOpen(false); toaster.error({ title: 'Ada Lovelace deleted' }) }}>Delete</Button>
            </>}>
            <Input value={typed} onValueChange={setTyped} placeholder="Ada Lovelace" />
          </Dialog>
        </div>
      </div>
    </Card>
  )
}
