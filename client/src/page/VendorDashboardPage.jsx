import { useState } from "react";
import VendorAppbar from "./VendorAppbar";
import { vendorPageCopy } from "./VendorDashboardData";
import VendorDashboardHomePage from "./VendorDashboardHomePage";
import VendorQrCodePage from "./VendorQrCodePage";
import VendorSettingsPage from "./VendorSettingsPage";
import VendorSidebar from "./VendorSidebar";
import VendorTransactionsPage from "./VendorTransactionsPage";

const getStoredVendor = () => {
  try {
    const user = JSON.parse(localStorage.getItem("cpacUser") || "{}");
    return {
      name: user.name || "Campus Cafe",
      email: user.email || "vendor@campus.edu",
    };
  } catch {
    return {
      name: "Campus Cafe",
      email: "vendor@campus.edu",
    };
  }
};

function VendorDashboardPage({ setPage }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [vendor, setVendor] = useState(getStoredVendor);

  const handleExit = () => {
    localStorage.removeItem("cpacToken");
    localStorage.removeItem("cpacUserType");
    localStorage.removeItem("cpacUser");
    setPage("login");
  };

  const [pageTitle, pageSubtitle] = vendorPageCopy[activeView] || vendorPageCopy.dashboard;
  const appbarTitle =
    activeView === "qr"
      ? "QR Code Management"
      : activeView === "transactions"
        ? "Transactions"
        : pageTitle;

  return (
    <div className="vendor-dashboard-page">
      <header className="vendor-page-topbar">
        <h1>{pageTitle}</h1>
        <p>{pageSubtitle}</p>
      </header>

      <div className="vendor-shell">
        <VendorSidebar
          activeView={activeView}
          onChangeView={setActiveView}
          onLogout={handleExit}
        />

        <main className="vendor-content">
          <VendorAppbar title={appbarTitle} vendor={vendor} />

          {activeView === "dashboard" && (
            <VendorDashboardHomePage onShowTransactions={() => setActiveView("transactions")} />
          )}
          {activeView === "qr" && <VendorQrCodePage />}
          {activeView === "transactions" && <VendorTransactionsPage />}
          {activeView === "settings" && (
            <VendorSettingsPage vendor={vendor} onProfileChange={setVendor} />
          )}
        </main>
      </div>
    </div>
  );
}

export default VendorDashboardPage;
