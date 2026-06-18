import { useState } from "react";
import { Icon } from "./StudentIcon";

function StudentAddMoneyPage() {
  const [topUpAmount, setTopUpAmount] = useState("");

  return (
    <section className="add-money-view" aria-label="Add money request">
      <div className="history-appbar add-money-appbar">
        <div>
          <h2>Add Money</h2>
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
            <strong>John Doe</strong>
            <span>Administrator</span>
          </div>
          <span className="profile-avatar">
            <Icon type="user" />
          </span>
        </div>
      </div>

      <div className="add-money-content">
        <div className="add-money-card">
          <h2>Request Add Money</h2>
          <label htmlFor="topUpAmount">Amount to Add</label>
          <div className="amount-field add-money-input">
            <span>$</span>
            <input
              id="topUpAmount"
              min="0"
              step="0.01"
              type="number"
              placeholder="0.00"
              value={topUpAmount}
              onChange={(event) => setTopUpAmount(event.target.value)}
            />
          </div>
          <div className="current-balance-panel">
            <span>Current Balance</span>
            <strong>$245.80</strong>
          </div>
          <button className="pay-now-button submit-request-button" type="button">
            Submit Request
          </button>
        </div>

        <div className="request-history-card">
          <h2>Request History</h2>
          <div className="request-list">
            <article className="request-item">
              <div>
                <strong>$50.00</strong>
                <span><Icon type="clock" />May 28, 2026 at 10:30 AM</span>
              </div>
              <em className="request-status pending">Pending</em>
            </article>
            <article className="request-item">
              <div>
                <strong>$100.00</strong>
                <span><Icon type="clock" />May 25, 2026 at 2:15 PM</span>
              </div>
              <em className="request-status approved">Approved</em>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StudentAddMoneyPage;
