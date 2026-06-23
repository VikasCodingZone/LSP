import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMoneyToStudent,
  approveVendor,
  getAdminStats,
  getAdminStudents,
  getAdminTransactions,
  getAdminVendors,
  rejectVendor,
} from "../api/admin";

const formatNumber = (value) => new Intl.NumberFormat("en-US").format(Number(value || 0));
const formatMoney = (value) => `$${formatNumber(Math.round(Number(value || 0)))}`;

const fallbackTransactions = [
  ["TXN001", "John Doe", "Campus Cafe", "$12.50", "Completed", "2 mins ago"],
  ["TXN002", "Jane Smith", "Library Store", "$8.00", "Completed", "5 mins ago"],
  ["TXN003", "Mike Johnson", "Sports Shop", "$25.00", "Pending", "10 mins ago"],
  ["TXN004", "Sarah Williams", "Campus Cafe", "$15.75", "Completed", "15 mins ago"],
];

const fallbackStudents = [
  {
    _id: "STU12345",
    name: "John Doe",
    email: "john.doe@university.edu",
    phone: "+1 234 567 8900",
    walletBalance: 245.8,
  },
  {
    _id: "STU12346",
    name: "Jane Smith",
    email: "jane.smith@university.edu",
    phone: "+1 234 567 8901",
    walletBalance: 180.5,
  },
  {
    _id: "STU12347",
    name: "Mike Johnson",
    email: "mike.johnson@university.edu",
    phone: "+1 234 567 8902",
    walletBalance: 92,
  },
  {
    _id: "STU12348",
    name: "Sarah Williams",
    email: "sarah.williams@university.edu",
    phone: "+1 234 567 8903",
    walletBalance: 320.75,
  },
];

function AdminDashboardPage({ setPage }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const admin = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("cpacUser") || "{}");
    } catch {
      return {};
    }
  }, []);

  const loadAdminData = useCallback(async (query = "") => {
    setIsLoading(true);
    setError("");

    try {
      const [statsData, studentsData, vendorsData, transactionsData] = await Promise.all([
        getAdminStats(),
        getAdminStudents(query),
        getAdminVendors(query),
        getAdminTransactions(),
      ]);

      setStats(statsData.stats);
      setStudents(studentsData.students || []);
      setVendors(vendorsData.vendors || []);
      setTransactions(transactionsData.transactions || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadAdminData("");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAdminData]);

  const handleSearch = (event) => {
    event.preventDefault();
    loadAdminData(search);
  };

  const handleVendorStatus = async (vendorId, action) => {
    setMessage("");
    setError("");

    try {
      const request = action === "approve" ? approveVendor : rejectVendor;
      await request(vendorId);
      setMessage(`Vendor ${action === "approve" ? "approved" : "rejected"} successfully.`);
      await loadAdminData(search);
    } catch (statusError) {
      setError(statusError.message);
    }
  };

  const handleAddMoney = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    try {
      await addMoneyToStudent({
        studentId: selectedStudent,
        amount,
        description: "Wallet top-up from admin dashboard",
      });
      setMessage("Money added to student wallet successfully.");
      setAmount("");
      await loadAdminData(search);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cpacToken");
    localStorage.removeItem("cpacUserType");
    localStorage.removeItem("cpacUser");
    setPage("admin-login");
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const statCards = [
    {
      label: "Total Students",
      value: formatNumber(stats?.totalStudents),
      trend: "12% vs last month",
      icon: "students",
      tone: "blue",
    },
    {
      label: "Total Vendors",
      value: formatNumber(stats?.totalVendors),
      trend: "5% vs last month",
      icon: "store",
      tone: "cyan",
    },
    {
      label: "Total Transactions",
      value: formatNumber(stats?.totalTransactions),
      trend: "18% vs last month",
      icon: "swap",
      tone: "plain",
    },
    {
      label: "Total Wallet Balance",
      value: formatMoney(stats?.totalWalletBalance),
      trend: "8% vs last month",
      icon: "wallet",
      tone: "plain",
    },
  ];

  const recentRows = transactions.length
    ? transactions.slice(0, 4).map((transaction, index) => [
        `TXN${String(index + 1).padStart(3, "0")}`,
        transaction.student?.name || "-",
        transaction.vendor?.name || "Wallet Top-up",
        formatMoney(transaction.amount),
        transaction.status || "Completed",
        new Date(transaction.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      ])
    : fallbackTransactions;
  const visibleStudents = students.length ? students : fallbackStudents;
  const studentTotalBalance = students.length
    ? students.reduce((total, student) => total + Number(student.walletBalance || 0), 0)
    : 125420;
  const averageStudentBalance = visibleStudents.length
    ? studentTotalBalance / visibleStudents.length
    : 0;
  const studentStats = [
    ["Total Students", formatNumber(stats?.totalStudents || visibleStudents.length)],
    ["Active Users", formatNumber(stats?.totalStudents || visibleStudents.length), "green"],
    ["Total Balance", formatMoney(stats?.totalWalletBalance || studentTotalBalance)],
    ["Avg. Balance", `$${averageStudentBalance.toFixed(2)}`],
  ];

  return (
    <div className="admin-dashboard-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-icon">
            <AdminIcon type="wallet" />
          </span>
          <div>
            <strong>Campus<br />Wallet</strong>
            <span>Admin Panel</span>
          </div>
          <button type="button" aria-label="Collapse sidebar">
            <AdminIcon type="chevron" />
          </button>
        </div>

        <nav>
          {[
            ["dashboard", "Dashboard", "grid"],
            ["students", "Students", "students"],
            ["vendors", "Vendors", "store"],
            ["transactions", "Transactions", "swap"],
            ["wallet", "Wallet", "wallet"],
            ["reports", "Reports", "chart"],
            ["settings", "Settings", "settings"],
          ].map(([view, label, icon]) => (
            <button
              className={activeView === view ? "active" : ""}
              key={view}
              type="button"
              onClick={() => setActiveView(view)}
            >
              <AdminIcon type={icon} />
              {label}
            </button>
          ))}
        </nav>

        <button className="admin-logout" type="button" onClick={handleLogout}>
          <AdminIcon type="logout" />
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-navbar">
          <div>
            <h1>{activeView === "students" ? "Student Management" : activeView === "dashboard" ? "Dashboard" : pageTitle(activeView)}</h1>
            <p>{activeView === "students" ? "Manage students and wallet balances" : today}</p>
          </div>

          <div className="admin-navbar-actions">
            <form className="admin-search" onSubmit={handleSearch}>
              <AdminIcon type="search" />
              <input
                type="search"
                placeholder="Search..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </form>
            <button className="admin-notification" type="button" aria-label="Notifications">
              <AdminIcon type="bell" />
              <span />
            </button>
            <div className="admin-user">
              <span>{admin.name || "Admin User"}</span>
              <strong>Administrator</strong>
            </div>
            <span className="admin-avatar">
              <AdminIcon type="user" />
            </span>
          </div>
        </header>

        {error && <p className="admin-alert error">{error}</p>}
        {message && <p className="admin-alert success">{message}</p>}

        {isLoading ? (
          <div className="admin-loading">Loading admin data...</div>
        ) : (
          <>
            {activeView === "dashboard" && (
              <>
                <section className="admin-stats-grid" aria-label="Dashboard statistics">
                  {statCards.map((card) => (
                    <article className="admin-stat-card" key={card.label}>
                      <div>
                        <span>{card.label}</span>
                        <strong>{card.value}</strong>
                        <em>↑ {card.trend}</em>
                      </div>
                      <span className={`admin-stat-icon ${card.tone}`}>
                        <AdminIcon type={card.icon} />
                      </span>
                    </article>
                  ))}
                </section>

                <section className="admin-chart-grid" aria-label="Dashboard charts">
                  <ChartPlaceholder title="Transaction Overview" text="Transaction chart visualization" />
                  <ChartPlaceholder title="Revenue Analytics" text="Revenue chart visualization" />
                </section>

                <section className="admin-recent-section">
                  <div className="admin-section-title">
                    <h2>Recent Transactions</h2>
                    <button type="button" onClick={() => setActiveView("transactions")}>View All</button>
                  </div>
                  <AdminTable
                    columns={["Transaction ID", "Student", "Vendor", "Amount", "Status", "Time"]}
                    rows={recentRows}
                    emptyText="No transactions found."
                  />
                </section>
              </>
            )}

            {activeView === "students" && (
              <>
                <section className="student-management-stats" aria-label="Student statistics">
                  {studentStats.map(([label, value, tone]) => (
                    <article key={label}>
                      <span>{label}</span>
                      <strong className={tone || ""}>{value}</strong>
                    </article>
                  ))}
                </section>

                <section className="student-management-tools" aria-label="Student tools">
                  <form className="student-management-search" onSubmit={handleSearch}>
                    <AdminIcon type="search" />
                    <input
                      type="search"
                      placeholder="Search students..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </form>
                  <button
                    className="student-add-button"
                    type="button"
                    onClick={() => setMessage("Students can be added from the signup flow.")}
                  >
                    <span>+</span>
                    Add Student
                  </button>
                </section>

                <section className="student-management-table">
                  <div className="admin-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Student ID</th>
                          <th>Name</th>
                          <th>Phone</th>
                          <th>Wallet Balance</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleStudents.map((student, index) => (
                          <tr key={student._id || student.email}>
                            <td>{student._id?.startsWith("STU") ? student._id : `STU${String(index + 12345)}`}</td>
                            <td>
                              <div className="student-name-cell">
                                <span>
                                  <AdminIcon type="user" />
                                </span>
                                <div>
                                  <strong>{student.name}</strong>
                                  <em>{student.email}</em>
                                </div>
                              </div>
                            </td>
                            <td>{student.phone || "-"}</td>
                            <td className="student-balance">{`$${Number(student.walletBalance || 0).toFixed(2)}`}</td>
                            <td>
                              <span className="student-active-pill">Active</span>
                            </td>
                            <td>
                              <button
                                className="student-money-button"
                                type="button"
                                onClick={() => {
                                  setSelectedStudent(student._id?.startsWith("STU") ? "" : student._id);
                                  setActiveView("wallet");
                                }}
                              >
                                <span>$</span>
                                Add Money
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}

            {activeView === "vendors" && (
              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <h2>Vendors</h2>
                  <span>{vendors.length} records</span>
                </div>
                <div className="admin-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.length === 0 ? (
                        <tr>
                          <td colSpan="5">No vendors found.</td>
                        </tr>
                      ) : (
                        vendors.map((vendor) => (
                          <tr key={vendor._id}>
                            <td>{vendor.name}</td>
                            <td>{vendor.email}</td>
                            <td>{vendor.phone || "-"}</td>
                            <td>
                              <span className={`admin-status ${vendor.vendorStatus || "pending"}`}>
                                {vendor.vendorStatus || "pending"}
                              </span>
                            </td>
                            <td>
                              <div className="admin-actions">
                                <button type="button" onClick={() => handleVendorStatus(vendor._id, "approve")}>
                                  Approve
                                </button>
                                <button type="button" onClick={() => handleVendorStatus(vendor._id, "reject")}>
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeView === "transactions" && (
              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <h2>Transaction History</h2>
                  <span>{transactions.length} recent</span>
                </div>
                <AdminTable
                  columns={["Student", "Vendor", "Type", "Amount", "Status", "Date"]}
                  rows={transactions.map((transaction) => [
                    transaction.student?.name || "-",
                    transaction.vendor?.name || "-",
                    transaction.type?.replace("_", " ") || "payment",
                    formatMoney(transaction.amount),
                    transaction.status,
                    new Date(transaction.createdAt).toLocaleString(),
                  ])}
                  emptyText="No transactions found."
                />
              </section>
            )}

            {activeView === "wallet" && (
              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <h2>Add Money to Student Wallet</h2>
                  <span>{formatMoney(stats?.totalWalletBalance)} total balance</span>
                </div>
                <form className="admin-money-form" onSubmit={handleAddMoney}>
                  <select
                    value={selectedStudent}
                    onChange={(event) => setSelectedStudent(event.target.value)}
                    required
                  >
                    <option value="">Select student wallet</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.email})
                      </option>
                    ))}
                  </select>
                  <input
                    min="1"
                    step="0.01"
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    required
                  />
                  <button type="submit" disabled={isSaving}>
                    {isSaving ? "Adding..." : "Add Money"}
                  </button>
                </form>
              </section>
            )}

            {(activeView === "reports" || activeView === "settings") && (
              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <h2>{pageTitle(activeView)}</h2>
                  <span>Admin module</span>
                </div>
                <p className="admin-empty-copy">This section is ready for the next set of admin tools.</p>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function pageTitle(view) {
  return view.charAt(0).toUpperCase() + view.slice(1);
}

function ChartPlaceholder({ title, text }) {
  return (
    <article className="admin-chart-card">
      <h2>{title}</h2>
      <div>
        <AdminIcon type="trend" />
        <span>{text}</span>
      </div>
    </article>
  );
}

function AdminTable({ columns, rows, emptyText }) {
  return (
    <div className="admin-table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>{emptyText}</td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={`${row[0]}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${cell}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function AdminIcon({ type }) {
  const icons = {
    bell: (
      <>
        <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
        <path d="M10 21h4" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-5" />
        <path d="M12 16V8" />
        <path d="M16 16v-3" />
      </>
    ),
    chevron: <path d="m15 18-6-6 6-6" />,
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2 3.4-.2-.1a1.8 1.8 0 0 0-2 .4l-.1.1h-4l-.1-.1a1.8 1.8 0 0 0-2-.4l-.2.1-2-3.4.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1.2H6v-4h.2a1.8 1.8 0 0 0 1.6-1.2 1.8 1.8 0 0 0-.4-2l-.1-.1 2-3.4.2.1a1.8 1.8 0 0 0 2-.4l.1-.1h4l.1.1a1.8 1.8 0 0 0 2 .4l.2-.1 2 3.4-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.6 1.2h.2v4h-.2a1.8 1.8 0 0 0-1.6 1.2Z" />
      </>
    ),
    store: (
      <>
        <path d="M4 10h16l-2-5H6l-2 5Z" />
        <path d="M6 10v9h12v-9" />
        <path d="M9 19v-5h6v5" />
      </>
    ),
    students: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M15 14.5a5 5 0 0 1 6 4.5" />
      </>
    ),
    swap: (
      <>
        <path d="M7 7h12" />
        <path d="m15 3 4 4-4 4" />
        <path d="M17 17H5" />
        <path d="m9 21-4-4 4-4" />
      </>
    ),
    trend: (
      <>
        <path d="m4 16 6-6 4 4 6-8" />
        <path d="M14 6h6v6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </>
    ),
    wallet: (
      <>
        <path d="M4 7a2 2 0 0 1 2-2h13v14H6a2 2 0 0 1-2-2V7Z" />
        <path d="M4 9h16" />
        <path d="M16 13h4v4h-4a2 2 0 0 1 0-4Z" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icons[type] || icons.grid}
    </svg>
  );
}

export default AdminDashboardPage;
