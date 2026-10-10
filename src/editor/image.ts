// TipTap's image node, keeping any data-* attributes (e.g. an id or signed
// id your server resolves later) through parsing, editing and getHTML().
// A method, not an arrow: TipTap's extend() needs `this.parent`.
import Image from '@tiptap/extension-image'

export const RichImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      data: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const out: Record<string, string> = {}
          for (const { name, value } of Array.from(element.attributes)) {
            if (name.startsWith('data-')) out[name] = value
          }
          return Object.keys(out).length ? out : null
        },
        renderHTML: (attributes: { data?: Record<string, string> | null }) => attributes.data || {},
      },
    }
  },
})
