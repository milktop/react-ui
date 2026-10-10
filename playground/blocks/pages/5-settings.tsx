/* Settings
  Sections of fields, each with its heading on the left. Changing anything brings up a bar to save or discard, which compares against what was saved. */
import { useState } from 'react'
import { Fields, Field, Input, Textarea, Select, Switch, RadioGroup, NumberInput, Avatar, Button, ActionBar, ThemeToggle, toaster } from '@milktop/react-ui'

const saved = {
  name: 'Grace Hopper', email: 'grace@example.com', bio: 'Maths and physics tutor in Bristol, 12 years.',
  rate: 40 as number | null, length: '60', timezone: 'Europe/London',
  remindStudents: true, remindMe: false, weekly: true,
}
type Settings = typeof saved

const zones = ['Europe/London', 'Europe/Paris', 'America/New_York', 'Asia/Tokyo']

function Section({ heading, description, children }: { heading: string, description: string, children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-b border-(--ui-border) py-8 first:pt-0 last:border-b-0 md:grid-cols-[16rem_1fr]">
      <div><h3 className="m-0 text-base font-semibold">{heading}</h3><p className="mt-1 mb-0 text-sm text-(--ui-muted)">{description}</p></div>
      <div className="max-w-xl">{children}</div>
    </section>
  )
}

export default function Settings() {
  const [settings, setSettings] = useState(saved)
  const [base, setBase] = useState(saved)
  const set = <K extends keyof Settings>(key: K) => (value: Settings[K]) => setSettings({ ...settings, [key]: value })
  const changed = (Object.keys(base) as (keyof Settings)[]).filter((key) => settings[key] !== base[key]).length

  return (
    <form onSubmit={(e) => { e.preventDefault(); setBase(settings); toaster.success({ title: 'Settings saved' }) }}>
      <h2 className="m-0 mb-8 text-xl font-bold">Settings</h2>
      <Section heading="Profile" description="What students and parents see.">
        <Fields>
          <Field span={12}>
            <div className="flex items-center gap-4"><Avatar size="lg" name={settings.name} /><Button size="sm">Change photo</Button></div>
          </Field>
          <Field label="Name" span={6}><Input value={settings.name} onValueChange={set('name')} /></Field>
          <Field label="Email" span={6}><Input type="email" value={settings.email} onValueChange={set('email')} /></Field>
          <Field label="Bio" hint="A line or two for your profile page." span={12}>
            <Textarea value={settings.bio} onValueChange={set('bio')} rows={3} />
          </Field>
        </Fields>
      </Section>
      <Section heading="Lessons" description="Defaults for new bookings.">
        <Fields>
          <Field label="Hourly rate" span={6}><NumberInput value={settings.rate} onValueChange={set('rate')} prefix="£" min={0} step={5} /></Field>
          <Field label="Time zone" span={6}><Select items={zones} value={settings.timezone} onValueChange={(v) => v && set('timezone')(v)} /></Field>
          <Field label="Usual length" span={12}>
            <RadioGroup orientation="horizontal" value={settings.length} onValueChange={(v) => v && set('length')(v)}
              items={[{ value: '45', label: '45 minutes' }, { value: '60', label: 'An hour' }, { value: '90', label: '90 minutes' }]} />
          </Field>
        </Fields>
      </Section>
      <Section heading="Notifications" description="Emails we send for you.">
        <div className="flex flex-col gap-4">
          <Switch label="Remind students the day before" checked={settings.remindStudents} onCheckedChange={set('remindStudents')} />
          <Switch label="Remind me an hour before" checked={settings.remindMe} onCheckedChange={set('remindMe')} />
          <Switch label="A weekly summary on Mondays" checked={settings.weekly} onCheckedChange={set('weekly')} />
        </div>
      </Section>
      <Section heading="Appearance" description="Stored on this device.">
        <ThemeToggle />
      </Section>

      <ActionBar open={changed > 0} onClose={() => setSettings(base)} selection={`${changed} unsaved ${changed === 1 ? 'change' : 'changes'}`}>
        <Button size="sm" variant="ghost" onClick={() => setSettings(base)}>Discard</Button>
        <Button size="sm" variant="primary" type="submit">Save</Button>
      </ActionBar>
    </form>
  )
}
