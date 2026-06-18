import { Icon } from "./StudentIcon";

function StudentProfilePage() {
  return (
    <section className="student-profile-view" aria-label="Student profile">
      <aside className="profile-overview-card">
        <span className="profile-large-avatar">
          <Icon type="user" />
        </span>
        <h2>John Doe</h2>
        <p>Student ID: STU12345</p>
        <div className="profile-wallet-summary">
          <span>Wallet Balance</span>
          <strong>$245.80</strong>
        </div>
      </aside>

      <div className="profile-settings-column">
        <form className="profile-settings-card">
          <h2>Personal Information</h2>
          <label htmlFor="studentFullName">Full Name</label>
          <div className="profile-input">
            <Icon type="user" />
            <input id="studentFullName" type="text" defaultValue="John Doe" />
          </div>

          <label htmlFor="studentEmail">Email Address</label>
          <div className="profile-input">
            <Icon type="mail" />
            <input id="studentEmail" type="email" defaultValue="john.doe@university.edu" />
          </div>

          <label htmlFor="studentPhone">Phone Number</label>
          <div className="profile-input">
            <Icon type="phone" />
            <input id="studentPhone" type="tel" defaultValue="+1 234 567 8900" />
          </div>

          <button className="profile-primary-button" type="button">
            Save Changes
          </button>
        </form>

        <form className="profile-settings-card security-card">
          <h2>Security Settings</h2>
          <label htmlFor="currentPassword">Current Password</label>
          <div className="profile-input">
            <Icon type="lock" />
            <input id="currentPassword" type="password" placeholder="Enter current password" />
          </div>

          <label htmlFor="newPassword">New Password</label>
          <div className="profile-input">
            <Icon type="lock" />
            <input id="newPassword" type="password" placeholder="Enter new password" />
          </div>

          <button className="profile-primary-button" type="button">
            Change Password
          </button>

          <div className="two-factor-row">
            <span className="two-factor-icon">
              <Icon type="shield" />
            </span>
            <div>
              <strong>Two-Factor Authentication</strong>
              <span>Add an extra layer of security</span>
            </div>
            <button type="button">Enable</button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default StudentProfilePage;
