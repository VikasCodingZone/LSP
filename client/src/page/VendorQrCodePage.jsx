import { Icon } from "./VendorIcon";

function VendorQrCodePage() {
  return (
    <section className="vendor-qr-management" aria-label="Vendor QR code management">
      <div className="vendor-qr-main-card">
        <h2>Your Payment QR Code</h2>
        <div className="vendor-qr-code-frame">
          <Icon type="qr" />
        </div>
        <button className="vendor-download-button" type="button">
          <Icon type="download" />
          Download QR Code
        </button>
        <button className="vendor-generate-button" type="button">
          <Icon type="refresh" />
          Generate New QR
        </button>
      </div>

      <div className="vendor-qr-side">
        <section className="vendor-qr-details-card">
          <h2>QR Code Details</h2>
          <dl>
            <div>
              <dt>Vendor ID</dt>
              <dd>VEN001</dd>
            </div>
            <div>
              <dt>Shop Name</dt>
              <dd>Campus Cafe</dd>
            </div>
            <div>
              <dt>QR Status</dt>
              <dd><span className="vendor-active-pill">Active</span></dd>
            </div>
            <div>
              <dt>Last Updated</dt>
              <dd>May 28, 2026</dd>
            </div>
          </dl>
        </section>

        <section className="vendor-qr-help-card">
          <h2>How to use:</h2>
          <ol>
            <li>Display this QR code at your shop counter</li>
            <li>Students scan the code using Campus Wallet app</li>
            <li>They enter the amount and confirm payment</li>
            <li>You receive instant payment notification</li>
          </ol>
        </section>
      </div>
    </section>
  );
}

export default VendorQrCodePage;
