// A component's API, read from its source (see api.ts): usage, props, parts.
import { Card } from '@milktop/react-ui'
import { apiOf } from './api'
import { Backticked } from './Demo'

export function ApiPanel({ file }: { file: string }) {
  const api = apiOf(file)
  return (
    <Card heading={`<${api.tag}>`} description={<Backticked text={api.summary} />} classes={{ heading: 'font-mono' }}>
      <div className="flex flex-col gap-4">
        {api.usage && (
          <pre className="m-0 overflow-x-auto rounded-md bg-(--ui-hover) p-4 text-xs leading-relaxed [tab-size:2]"><code>{api.usage}</code></pre>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="text-xs text-(--ui-muted)">
              <tr><th className="py-2 pr-4 font-medium">Prop</th><th className="py-2 pr-4 font-medium">Default</th><th className="py-2 font-medium">Notes</th></tr>
            </thead>
            <tbody>
              {api.props.map((prop) => (
                <tr key={prop.name} className="border-t border-(--ui-border) align-top">
                  <td className="py-2 pr-4 font-mono text-xs whitespace-nowrap">{prop.name}</td>
                  <td className="max-w-40 truncate py-2 pr-4 font-mono text-xs whitespace-nowrap text-(--ui-muted)" title={prop.default}>{prop.default}</td>
                  <td className="min-w-64 py-2 text-(--ui-muted)"><Backticked text={prop.note} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {([['Parts (keys for classes)', api.parts], ['By hand', api.byHand]] as const).map(([label, names]) => names.length > 0 && (
          <div key={label} className="flex flex-wrap items-center gap-1.5 text-xs text-(--ui-muted)">
            <span>{label}:</span>
            {names.map((name) => <code key={name} className="rounded bg-(--ui-hover) px-1.5 py-0.5 text-(--ui-text)">{name}</code>)}
          </div>
        ))}
      </div>
    </Card>
  )
}
