/* Order, sizes, light and dark only, labels
  `options` sets which schemes show and their order; `system={false}` leaves out System; `labels` and `label` rename them; `size` fits every variant. */
import { ThemeToggle } from '@milktop/react-ui'

export default function Example() {
  return <>
    <ThemeToggle options={['light', 'dark', 'system']} />
    <ThemeToggle system={false} />
    <ThemeToggle labels={{ light: 'Clair', dark: 'Sombre', system: 'Système' }} label="Thème" />
    <ThemeToggle size="sm" />
    <ThemeToggle size="lg" variant="toggle" />
  </>
}
