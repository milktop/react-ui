// A component's Styling panel (see styling.ts): the tokens it uses (linking to
// Tokens), its own variables, its parts and their states, and starter code.
import { Card, Table } from '@milktop/react-ui'
import { stylingOf } from './styling'
import { isColour } from './tokens'

const chip = 'inline-flex items-center gap-1.5 rounded bg-(--ui-hover) px-1.5 py-0.5 font-mono text-xs text-(--ui-text) no-underline'
const heading = 'm-0 mb-1.5 text-xs font-semibold tracking-wide text-(--ui-muted) uppercase'
const hint = 'm-0 mb-2 text-xs text-(--ui-muted)'

export function StylingPanel({ file }: { file: string }) {
  const s = stylingOf(file)
  return (
    <Card heading={`<${s.tag}>`} classes={{ heading: 'font-mono' }}>
      <div className="flex flex-col gap-5">
        {s.tokens.length > 0 && (
          <div>
            <h4 className={heading}>Tokens it uses</h4>
            <p className={hint}>Set these on the app, a wrapper or the component itself (in <code>style</code>); they reach every part that uses them.</p>
            <div className="flex flex-wrap gap-1.5">
              {s.tokens.map((name) => (
                <a key={name} href={`#/tokens?q=${name}`} className={`${chip} hover:bg-(--ui-border)`}>
                  {isColour(name) && <span className="inline-block h-2.5 w-2.5 rounded-[2px] border border-(--ui-border)" style={{ background: `var(--${name})` }} />}
                  --{name}
                </a>
              ))}
            </div>
          </div>
        )}
        {s.own.length > 0 && (
          <div>
            <h4 className={heading}>Its own variables</h4>
            <p className={hint}>For what no shared token covers; set them like tokens.</p>
            <div className="flex flex-wrap gap-1.5">{s.own.map((name) => <span key={name} className={chip}>--{name}</span>)}</div>
          </div>
        )}
        {s.parts.length > 0 && (
          <div>
            <h4 className={heading}>Parts</h4>
            <p className={hint}>
              The key for <code>classes</code> (one instance), and the selector for your CSS (every instance). The states are what
              its styles are keyed on; restate the ones you change. Ark's parts carry Zag's state attributes (<code>[data-state=open]</code>).
            </p>
            <Table size="sm">
              <table>
                <thead><tr><th>Key</th><th>Selector</th><th>States</th><th /></tr></thead>
                <tbody>
                  {s.parts.map((p) => (
                    <tr key={p.name}>
                      <td><code className="text-xs">{p.key}</code></td>
                      <td className="whitespace-nowrap"><code className="text-xs">{p.selector}</code></td>
                      <td className="font-mono text-xs whitespace-normal text-(--ui-muted)">{p.states.join('  ') || '—'}</td>
                      <td>{p.ark && <span title="An Ark part: carries Zag's data-part and state attributes"
                        className="inline-block rounded bg-(--ui-accent-soft) px-1.5 text-[11px] font-medium text-(--ui-accent-soft-text)">Ark</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Table>
          </div>
        )}
        {s.snippets.length > 0 && (
          <div>
            <h4 className={heading}>Starter code</h4>
            <div className="flex flex-col gap-3">
              {s.snippets.map((snip) => (
                <div key={snip.title} className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-xs text-(--ui-muted)">{snip.title}</span>
                  <pre className="m-0 overflow-x-auto rounded-md bg-(--ui-hover) p-3 text-xs leading-relaxed [tab-size:2]"><code>{snip.code}</code></pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
