/* Menu and toggle
  `variant="menu"`: one button showing the current choice, opening a menu of all of them (`iconOnly` lists just icons). `variant="toggle"` flips between light and dark. `mobile` switches variant on narrow screens. */
import { ThemeToggle } from '@milktop/react-ui'

export default function Example() {
  return <>
    <ThemeToggle variant="menu" />
    <ThemeToggle variant="menu" iconOnly />
    <ThemeToggle variant="toggle" />
    <ThemeToggle mobile="menu" />
  </>
}
