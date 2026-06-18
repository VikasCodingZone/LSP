import { vendorTransactions } from "./VendorDashboardData";
import { Icon } from "./VendorIcon";

function VendorTransactionsPage() {
  return (
    <>
      <section className="vendor-stats-grid vendor-transaction-stats" aria-label="Vendor transaction statistics">
        <article>
          <span>Today's Revenue</span>
          <strong>$236.25</strong>
        </article>
        <article>
          <span>This Week</span>
          <strong>$1,450.00</strong>
        </article>
        <article>
          <span>This Month</span>
          <strong>$4,820.00</strong>
        </article>
        <article>
          <span>Total Transactions</span>
          <strong>342</strong>
        </article>
      </section>

      <section className="vendor-transaction-page" aria-label="Vendor transactions">
        <div className="vendor-transaction-tools">
          <label className="vendor-transaction-search">
            <Icon type="search" />
            <input type="search" placeholder="Search transactions..." />
          </label>
          <button className="vendor-date-button" type="button">
            <Icon type="calendar" />
            Date Range
          </button>
          <button className="vendor-export-button" type="button">
            <Icon type="download" />
            Export
          </button>
        </div>

        <div className="vendor-transactions-table vendor-full-transactions-table">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vendorTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>
                    <strong>{transaction.customer}</strong>
                    <span>{transaction.customerId}</span>
                  </td>
                  <td>{transaction.amount}</td>
                  <td>
                    {transaction.date}
                    <span>{transaction.time}</span>
                  </td>
                  <td>
                    <span className="vendor-status-pill">{transaction.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default VendorTransactionsPage;
