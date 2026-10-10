/* Sign in
  A centred card: email and password, with errors shown in their fields, a remember-me box and a social option. (Any email and an 8-character password sign in.) */
import { useState, type FormEvent } from 'react'
import { Card, Fields, Field, Input, PasswordInput, Checkbox, Button, Alert } from '@milktop/react-ui'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<{ email?: string | null, password?: string | null }>({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const next = {
      email: /\S+@\S+\.\S+/.test(email) ? null : 'Enter your email address',
      password: password.length >= 8 ? null : 'At least 8 characters',
    }
    setErrors(next)
    if (next.email || next.password) return
    setBusy(true)
    await new Promise((done) => setTimeout(done, 800))
    setBusy(false)
    setDone(true)
  }

  return (
    <div className="flex min-h-[36rem] items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex size-10 items-center justify-center rounded-[calc(var(--ui-radius)+4px)] bg-(--ui-accent) font-bold text-(--ui-accent-text)">T</span>
          <div><h2 className="m-0 text-xl font-bold">Sign in to TutorApp</h2><p className="mt-1 mb-0 text-sm text-(--ui-muted)">Welcome back.</p></div>
        </div>
        <Card>
          {done ? <Alert variant="success" heading="Signed in">This is where your app would take over.</Alert> : (
            <form onSubmit={submit} noValidate className="flex flex-col gap-5">
              <Fields>
                <Field label="Email" error={errors.email} span={12}>
                  <Input type="email" autoComplete="email" value={email} onValueChange={setEmail} />
                </Field>
                <Field label="Password" error={errors.password} span={12}>
                  <PasswordInput autoComplete="current-password" value={password} onValueChange={setPassword} />
                </Field>
              </Fields>
              <div className="flex items-center justify-between">
                <Checkbox label="Remember me" checked={remember} onCheckedChange={setRemember} />
                <a href="#/blocks/sign-in" className="text-sm text-(--ui-accent)">Forgot password?</a>
              </div>
              <Button type="submit" variant="primary" loading={busy} className="w-full">Sign in</Button>
              <div className="flex items-center gap-3 text-xs text-(--ui-muted)"><span className="h-px flex-1 bg-(--ui-border)" />or<span className="h-px flex-1 bg-(--ui-border)" /></div>
              <Button icon="logos:google-icon" className="w-full">Continue with Google</Button>
            </form>
          )}
        </Card>
        <p className="m-0 text-center text-sm text-(--ui-muted)">New here? <a href="#/blocks/sign-in" className="text-(--ui-accent)">Create an account</a></p>
      </div>
    </div>
  )
}
