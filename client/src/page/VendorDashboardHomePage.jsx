import { vendorTransactions } from "./VendorDashboardData";
import { Icon } from "./VendorIcon";

function VendorDashboardHomePage({ onShowTransactions }) {
  return (
    <>
      <section className="vendor-stats-grid" aria-label="Vendor sales statistics">
        <article>
          <div>
            <span>Today's Sales</span>
            <strong>$236.25</strong>
            <em><Icon type="trend" />12% vs last month</em>
          </div>
          <Icon type="dollar" />
        </article>
        <article>
          <div>
            <span>This Month</span>
            <strong>$4,820</strong>
            <em><Icon type="trend" />8% vs last month</em>
          </div>
          <Icon type="calendar" />
        </article>
        <article>
          <div>
            <span>Total Transactions</span>
            <strong>342</strong>
            <em><Icon type="trend" />15% vs last month</em>
          </div>
          <Icon type="bag" />
        </article>
        <article>
          <div>
            <span>Avg. Order Value</span>
            <strong>$14.10</strong>
          </div>
          <em aria-label="Order value trending up"><Icon type="trend" /></em>
        </article>
      </section>

      <section className="vendor-qr-panel">
        <div className="vendor-qr-preview">
          <Icon type="qr" />
          <span>Your QR Code</span>
        </div>
        <div>
          <h2>Payment QR Code</h2>
          <p>Students can scan this QR code to make payments to your store.</p>
          <button type="button">
            <Icon type="download" />
            Download QR Code
          </button>
        </div>
      </section>

      <section className="vendor-transactions-section">
        <div className="vendor-section-heading">
          <h2>Today's Transactions</h2>
          <button type="button" onClick={onShowTransactions}>View All</button>
        </div>

        <div className="vendor-transactions-table">
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
                  <td>{transaction.customer}</td>
                  <td>{transaction.amount}</td>
                  <td>
                    {transaction.date}
                    <span>{transaction.time}</span>
                  </td>
                  <td>{transaction.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default VendorDashboardHomePage;
