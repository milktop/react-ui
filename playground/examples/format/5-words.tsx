/* The components' words
  The same `LocaleProvider` picks their words too: placeholders, empty states, summaries and screen-reader labels, in English or French (built in). `messages` changes any of them, here the table's empty text; a prop given straight to a component still wins. */
import { useState } from 'react'
import {
  LocaleProvider, Attachments, CopyButton, Pagination, PasswordInput, Segmented, Select, SwatchPicker, Table, TagsInput, confirm, Button,
} from '@milktop/react-ui'

const locales = [{ value: 'en-GB', label: 'English' }, { value: 'fr-FR', label: 'Français' }]
const vets = [{ value: 1, label: 'Dr Martin' }, { value: 2, label: 'Dr Dubois' }]

export default function Example() {
  const [locale, setLocale] = useState('fr-FR')
  return (
    <div className="flex w-full flex-col gap-5">
      <Segmented size="sm" items={locales} value={locale} onValueChange={(v) => v && setLocale(v)} />
      <LocaleProvider locale={locale} messages={{ table: { empty: locale === 'fr-FR' ? 'Aucun patient' : 'No patients yet' } }}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label="Vet" items={vets} />
          <Select label="Vet (searchable)" items={vets} searchable />
          <TagsInput label="Tags" />
          <PasswordInput label="Password" />
          <SwatchPicker label="Colour" variant="popover" />
          <div className="flex items-end gap-2">
            <CopyButton value="ABC-123" />
            <Button onClick={() => confirm({ heading: 'Archive?', typeToConfirm: 'Rex' })}>confirm()</Button>
          </div>
          <div className="sm:col-span-2"><Attachments maxFiles={3} addable removable /></div>
          <div className="sm:col-span-2"><Table columns={[{ key: 'name', label: 'Name' }]} rows={[]} /></div>
          <div className="sm:col-span-2"><Pagination count={95} summary /></div>
        </div>
      </LocaleProvider>
    </div>
  )
}
