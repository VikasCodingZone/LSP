import { transactions } from "./StudentDashboardData";
import { Icon } from "./StudentIcon";

function StudentTransactionsPage({ displayName = "Student" }) {
  return (
    <section className="transaction-history-view" aria-label="Transaction history">
      <div className="history-appbar">
        <div>
          <h2>Transaction History</h2>
          <p>Wednesday, June 17, 2026</p>
        </div>
        <div className="history-profile">
          <label className="compact-search">
            <Icon type="search" />
            <input type="search" placeholder="Search..." />
          </label>
          <button className="notification-button" type="button" aria-label="Notifications">
            <Icon type="bell" />
            <span />
          </button>
          <div className="profile-summary">
            <strong>{displayName}</strong>
            <span>Student</span>
          </div>
          <span className="profile-avatar">
            <Icon type="user" />
          </span>
        </div>
      </div>

      <div className="history-tools">
        <label className="history-search">
          <Icon type="search" />
          <input type="search" placeholder="Search transactions..." />
        </label>
        <button className="history-tool-button" type="button">
          <Icon type="filter" />
          Filter
        </button>
        <button className="history-export-button" type="button">
          <Icon type="download" />
          Export
        </button>
      </div>

      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Vendor/Description</th>
              <th>Amount</th>
              <th>Date &amp; Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id}</td>
                <td>{transaction.vendor}</td>
                <td className={transaction.amount.startsWith("+") ? "positive" : ""}>
                  {transaction.amount}
                </td>
                <td>
                  {transaction.date}
                  <span>{transaction.time}</span>
                </td>
                <td>
                  <span className="status-pill">{transaction.status}</span>
                </td>
                <td>
                  <button className="receipt-button" type="button">
                    <Icon type="download" />
                    Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default StudentTransactionsPage;
