/* Menu and toggle
  `variant="menu"`: one button showing the current choice, opening a menu of all of them (`iconOnly` lists just icons). It opens `bottom-end`, lined up for a header's right-hand corner; `placement` changes that (`bottom-start` on the left). `variant="toggle"` flips between light and dark. `mobile` switches variant on narrow screens. */
import { ThemeToggle } from '@milktop/react-ui'

export default function Example() {
  return <>
    <ThemeToggle variant="menu" placement="bottom-start" />
    <ThemeToggle variant="menu" iconOnly />
    <ThemeToggle variant="toggle" />
    <ThemeToggle mobile="menu" />
  </>
}
