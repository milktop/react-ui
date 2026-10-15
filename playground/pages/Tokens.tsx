// Tokens: every --ui-* token by group, with what it styles and its light and
// dark values, searchable. A Styling panel's links open it filtered
// (#/tokens?q=ui-accent).
import { useState } from 'react'
import { Input, Table } from '@milktop/react-ui'
import { groupedTokens, isColour } from '../lib/tokens'

const code = 'rounded bg-(--ui-hover) px-1 text-xs'

export function Tokens({ query: linked }: { query: string }) {
  const [query, setQuery] = useState(linked)
  // Each link followed opens it filtered afresh.
  const [shownLink, setShownLink] = useState(linked)
  if (linked !== shownLink) {
    setShownLink(linked)
    setQuery(linked)
  }

  const q = query.trim().toLowerCase()
  const shown = groupedTokens.map((group) => ({
    ...group, tokens: q ? group.tokens.filter((token) => token.name.includes(q) || group.title.toLowerCase().includes(q)) : group.tokens,
  })).filter((group) => group.tokens.length)

  return <>
    <h1 className="m-0 text-xl font-bold">Tokens</h1>
    <p className="mt-1 mb-0 text-sm text-(--ui-muted)">
      Every <code className={code}>--ui-*</code> token, with what it styles and its light and dark values (read
      from <code className={code}>theme.css</code>). Set them in your app's CSS on <code className={code}>:root</code> to
      brand it, or on any element to restyle what's inside it. Theming shows how.
    </p>
    <section className="flex flex-col gap-3 py-5">
      <h2 className="m-0 text-base font-semibold">Find a token</h2>
      <Input icon="lucide:search" placeholder="accent, sidebar, radius…" value={query} onValueChange={setQuery} className="w-64 max-w-full" />
    </section>
    {shown.map((group) => (
      <section key={group.title} className="flex flex-col gap-2 py-5">
        <h2 className="m-0 text-base font-semibold">{group.title}</h2>
        {group.about && <p className="m-0 text-sm text-(--ui-muted)">{group.about}</p>}
        <Table>
          <table>
            <thead><tr><th>Token</th><th>Light</th><th>Dark</th></tr></thead>
            <tbody>
              {group.tokens.map((token) => (
                <tr key={token.name}>
                  <td>
                    {isColour(token.name) && <span className="mr-2 inline-block h-5 w-5 rounded border border-(--ui-border) align-middle" style={{ background: `var(--${token.name})` }} />}
                    <code className="text-xs">--{token.name}</code>
                  </td>
                  <td className="text-xs break-words whitespace-normal text-(--ui-muted)"><code>{token.light}</code></td>
                  <td className="text-xs break-words whitespace-normal text-(--ui-muted)"><code>{token.dark || 'same'}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Table>
      </section>
    ))}
    {!shown.length && <p className="text-sm text-(--ui-muted)">No token matches “{query}”.</p>}
  </>
}
