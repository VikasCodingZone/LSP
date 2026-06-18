function VendorSettingsPage() {
  return (
    <section className="vendor-card vendor-settings-card">
      <h2>Store Settings</h2>
      <label htmlFor="vendorStoreName">Store Name</label>
      <input id="vendorStoreName" type="text" defaultValue="Campus Cafe" />
      <label htmlFor="vendorEmail">Email Address</label>
      <input id="vendorEmail" type="email" defaultValue="vendor@campus.edu" />
      <button type="button">Save Settings</button>
    </section>
  );
}

export default VendorSettingsPage;
