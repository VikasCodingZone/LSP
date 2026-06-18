import { Icon } from "./VendorIcon";

function VendorAppbar({ title }) {
  return (
    <div className="vendor-appbar">
      <div>
        <h2>{title}</h2>
        <p>Thursday, June 18, 2026</p>
      </div>
      <div className="vendor-appbar-actions">
        <label className="vendor-search">
          <Icon type="search" />
          <input type="search" placeholder="Search..." />
        </label>
        <button className="vendor-notification" type="button" aria-label="Notifications">
          <Icon type="bell" />
          <span />
        </button>
        <div className="vendor-user-summary">
          <strong>Campus Cafe</strong>
          <span>Administrator</span>
        </div>
        <span className="vendor-avatar">
          <Icon type="user" />
        </span>
      </div>
    </div>
  );
}

export default VendorAppbar;
