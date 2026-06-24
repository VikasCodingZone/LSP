import { useEffect, useState } from "react";
import { Icon } from "./StudentIcon";

function StudentScanPayPage({ student }) {
  const [qrScanned, setQrScanned] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    if (qrScanned) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setQrScanned(true);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [qrScanned]);

  return (
    <section className="scan-pay-view" aria-label="Scan to pay">
      <div className="scanner-card">
        <button className="scanner-window" type="button" onClick={() => setQrScanned(true)}>
          <Icon type="qr" />
          <span>Point camera at vendor QR code</span>
        </button>
        <p>{qrScanned ? "QR code scanned successfully" : "Scanning for QR code..."}</p>
        <div className="scan-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      {qrScanned && (
        <div className="payment-card">
          <h2>Enter Amount</h2>
          <label htmlFor="paymentAmount">Payment Amount</label>
          <div className="amount-field">
            <span>$</span>
            <input
              id="paymentAmount"
              min="0"
              step="0.01"
              type="number"
              placeholder="0.00"
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
            />
          </div>
          <div className="vendor-summary">
            <span>Vendor</span>
            <strong>Campus Cafe</strong>
            <span>Your Balance</span>
            <strong className="balance-value">${Number(student?.walletBalance || 0).toFixed(2)}</strong>
          </div>
          <button className="pay-now-button" type="button">
            Pay Now
          </button>
        </div>
      )}
    </section>
  );
}

export default StudentScanPayPage;
