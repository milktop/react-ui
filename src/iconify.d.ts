// iconify-icon is a custom element: <iconify-icon icon="lucide:check" />.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        icon: string
        width?: string | number
        height?: string | number
        flip?: string
        rotate?: string | number
      }
    }
  }
}

export {}
