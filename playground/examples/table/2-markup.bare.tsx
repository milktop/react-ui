/* Written as markup
  Without `columns`, write the <table> yourself: it gets the same look (use `data-align` on cells), but no sorting, selection or loading states. */
import { Table } from '@milktop/react-ui'

const invoices = [
  { id: 'INV-031', student: 'Ada Lovelace', date: '1 Oct', amount: 120 },
  { id: 'INV-030', student: 'Alan Turing', date: '24 Sep', amount: 140 },
  { id: 'INV-029', student: 'Grace Hopper', date: '17 Sep', amount: 90 },
]

export default function Example() {
  return (
    <Table>
      <table>
        <thead>
          <tr><th>Invoice</th><th>Student</th><th>Date</th><th data-align="end">Amount</th></tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}><td>{invoice.id}</td><td>{invoice.student}</td><td>{invoice.date}</td><td data-align="end">£{invoice.amount}</td></tr>
          ))}
          <tr className="font-semibold">
            <td colSpan={3}>Total</td>
            <td data-align="end">£{invoices.reduce((sum, invoice) => sum + invoice.amount, 0)}</td>
          </tr>
        </tbody>
      </table>
    </Table>
  )
}
