/**
 * A password input with a button to show or hide it. Other attributes go on
 * the <input>.
 *
 *   <PasswordInput label="Password" value={password} onValueChange={setPassword} autoComplete="new-password" />
 *
 * - `value`, `defaultValue`; `onValueChange`: called with the new text
 * - `icon`: an Iconify name before it
 * - `visible`, `defaultVisible`; `onVisibilityChange`: whether the password shows
 *
 * By hand, with Ark's parts:
 *
 *   <PasswordInput.Root>
 *     <PasswordInput.Label>Password</PasswordInput.Label>
 *     <PasswordInput.Control>
 *       <PasswordInput.Input />
 *       <PasswordInput.VisibilityTrigger><PasswordInput.Indicator fallback="Show">Hide</PasswordInput.Indicator></PasswordInput.VisibilityTrigger>
 *     </PasswordInput.Control>
 *   </PasswordInput.Root>
 */
import type { ChangeEvent, ComponentProps, ReactNode } from 'react'
import { PasswordInput as Ark, usePasswordInput, type PasswordInputVisibilityChangeDetails } from '@ark-ui/react/password-input'
import { useFieldContext } from '@ark-ui/react/field'
import 'iconify-icon'
import { cx, partsOf, withParts, type Classes } from '../utils.js'
import { useMessages } from '../format/LocaleProvider.js'
import '../theme.css'
import './password-input.css'

export type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'> & {
  label?: ReactNode
  onValueChange?: (value: string) => void
  icon?: string | null
  visible?: boolean
  defaultVisible?: boolean
  onVisibilityChange?: (visible: boolean, details: PasswordInputVisibilityChangeDetails) => void
  classes?: Classes<'root' | 'label' | 'control' | 'icon' | 'input' | 'visibilityTrigger'>
}

function PasswordInputShortcut({
  label = null, icon = null, visible, defaultVisible, onVisibilityChange, onValueChange, onChange, disabled,
  className, classes, ...rest
}: PasswordInputProps) {
  const t = useMessages()
  const field = useFieldContext()
  const part = partsOf('password-input', classes)
  const password = usePasswordInput({
    ...(visible !== undefined && { visible }),
    ...(defaultVisible !== undefined && { defaultVisible }),
    ...(disabled !== undefined && { disabled }),
    ...(t.zag.passwordInput && { translations: t.zag.passwordInput }),
    ...(onVisibilityChange && { onVisibilityChange: (details) => onVisibilityChange(details.visible, details) }),
  })

  function change(e: ChangeEvent<HTMLInputElement>) {
    onChange?.(e)
    onValueChange?.(e.target.value)
  }

  return (
    <Ark.RootProvider value={password} {...part('root')} className={cx(className, classes?.root)}>
      {label && !field && <Ark.Label {...part('label')}>{label}</Ark.Label>}
      <Ark.Control {...part('control')}>
        {icon && <iconify-icon {...part('icon')} icon={icon} aria-hidden="true" />}
        <Ark.Input {...rest} {...part('input')} onChange={change} />
        <Ark.VisibilityTrigger {...part('visibility-trigger')}>
          <iconify-icon icon={password.visible ? 'lucide:eye-off' : 'lucide:eye'} aria-hidden="true" />
        </Ark.VisibilityTrigger>
      </Ark.Control>
    </Ark.RootProvider>
  )
}

export const PasswordInput = withParts(PasswordInputShortcut, {
  Root: Ark.Root,
  RootProvider: Ark.RootProvider,
  Label: Ark.Label,
  Control: Ark.Control,
  Input: Ark.Input,
  VisibilityTrigger: Ark.VisibilityTrigger,
  Indicator: Ark.Indicator,
  Context: Ark.Context,
})
