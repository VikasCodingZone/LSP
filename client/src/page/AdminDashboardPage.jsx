import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveVendor,
  getAdminStats,
  getAdminStudents,
  getAdminTransactions,
  getAdminVendors,
  rejectVendor,
  getAdminWalletRequests,
  updateWalletRequestStatus,
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

const fallbackVendors = [
  {
    _id: "V001",
    name: "Campus Cafe",
    owner: "Robert Brown",
    email: "cafe@campus.edu",
    phone: "+1 234 567 8900",
    vendorStatus: "approved",
    totalSales: 12450,
  },
  {
    _id: "V002",
    name: "Library Store",
    owner: "Emma Wilson",
    email: "library@campus.edu",
    phone: "+1 234 567 8901",
    vendorStatus: "approved",
    totalSales: 8320,
  },
  {
    _id: "V003",
    name: "Sports Shop",
    owner: "James Davis",
    email: "sports@campus.edu",
    phone: "+1 234 567 8902",
    vendorStatus: "rejected",
    totalSales: 5670,
  },
];

const fallbackWalletRequests = [
  {
    id: "REQ001",
    student: "John Doe",
    studentId: "STU12345",
    amount: 50,
    requestDate: "May 28, 2026",
    requestTime: "10:30 AM",
    status: "pending",
  },
  {
    id: "REQ002",
    student: "Jane Smith",
    studentId: "STU12346",
    amount: 100,
    requestDate: "May 28, 2026",
    requestTime: "9:15 AM",
    status: "pending",
  },
  {
    id: "REQ003",
    student: "Mike Johnson",
    studentId: "STU12347",
    amount: 75,
    requestDate: "May 27, 2026",
    requestTime: "4:45 PM",
    status: "approved",
  },
];

function AdminDashboardPage({ setPage }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [walletRequests, setWalletRequests] = useState([]);

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
      const [statsData, studentsData, vendorsData, transactionsData, walletRequestsData] = await Promise.all([
        getAdminStats(),
        getAdminStudents(query),
        getAdminVendors(query),
        getAdminTransactions(),
        getAdminWalletRequests(),
      ]);

      setStats(statsData.stats);
      setStudents(studentsData.students || []);
      setVendors(vendorsData.vendors || []);
      setTransactions(transactionsData.transactions || []);

      const formattedRequests = (walletRequestsData.requests || []).map((req) => {
        const date = new Date(req.createdAt);
        return {
          id: req._id || req.id,
          student: req.student?.name || "Student",
          studentId: req.student?._id ? `STU${req.student._id.slice(-5).toUpperCase()}` : "STU12345",
          amount: req.amount,
          requestDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          requestTime: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          status: req.status === "completed" ? "approved" : req.status === "failed" ? "rejected" : "pending",
        };
      });
      setWalletRequests(formattedRequests);
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

  const handleWalletRequestStatus = async (requestId, nextStatus) => {
    setMessage("");
    setError("");

    try {
      await updateWalletRequestStatus(requestId, { status: nextStatus });
      setMessage(`Money addition request ${nextStatus} successfully.`);
      await loadAdminData(search);
    } catch (statusError) {
      setError(statusError.message);
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
  const visibleVendors = vendors.length ? vendors : fallbackVendors;
  const getVendorSales = (vendor) => {
    if (vendor.totalSales) {
      return Number(vendor.totalSales);
    }

    return transactions.reduce((total, transaction) => {
      const transactionVendorId = transaction.vendor?._id || transaction.vendor;
      const transactionVendorName = transaction.vendor?.name;
      const isVendorMatch = transactionVendorId === vendor._id || transactionVendorName === vendor.name;

      return isVendorMatch ? total + Number(transaction.amount || 0) : total;
    }, 0);
  };
  const getVendorStatusLabel = (status) => {
    if (status === "approved") {
      return "Active";
    }

    if (status === "rejected") {
      return "Inactive";
    }

    return "Pending";
  };
  const pendingWalletRequests = walletRequests.filter((request) => request.status === "pending").length;

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

        <nav aria-label="Admin dashboard navigation">
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

        <div className="admin-sidebar-footer">
          <button className="admin-logout" type="button" onClick={handleLogout}>
            <AdminIcon type="logout" />
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-navbar">
          <div>
            <h1>
              {activeView === "students"
                ? "Student Management"
                : activeView === "vendors"
                  ? "Vendor Management"
                  : activeView === "wallet"
                    ? "Wallet Management"
                    : activeView === "dashboard"
                      ? "Dashboard"
                      : pageTitle(activeView)}
            </h1>
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
                                onClick={() => setActiveView("wallet")}
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
              <>
                <section className="vendor-management-tools" aria-label="Vendor tools">
                  <form className="vendor-management-search" onSubmit={handleSearch}>
                    <AdminIcon type="search" />
                    <input
                      type="search"
                      placeholder="Search vendors..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </form>
                  <button
                    className="vendor-add-button"
                    type="button"
                    onClick={() => setMessage("Vendors can be added from the signup flow.")}
                  >
                    <span>+</span>
                    Add Vendor
                  </button>
                </section>

                <section className="vendor-management-table">
                  <div className="admin-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Vendor ID</th>
                          <th>Shop Name</th>
                          <th>Owner</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Status</th>
                          <th>Total Sales</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleVendors.map((vendor, index) => {
                          const statusLabel = getVendorStatusLabel(vendor.vendorStatus);
                          const vendorId = vendor._id?.startsWith("V")
                            ? vendor._id
                            : `V${String(index + 1).padStart(3, "0")}`;

                          return (
                            <tr key={vendor._id || vendor.email}>
                              <td>{vendorId}</td>
                              <td>{vendor.name}</td>
                              <td>{vendor.owner || vendor.name}</td>
                              <td>{vendor.email}</td>
                              <td>{vendor.phone || "-"}</td>
                              <td>
                                <span className={`vendor-status ${statusLabel.toLowerCase()}`}>
                                  {statusLabel}
                                </span>
                              </td>
                              <td className="vendor-sales">{formatMoney(getVendorSales(vendor))}</td>
                              <td>
                                <div className="vendor-row-actions">
                                  <button
                                    type="button"
                                    aria-label={`Show QR code for ${vendor.name}`}
                                    onClick={() => setMessage(`QR tools for ${vendor.name} are ready for setup.`)}
                                  >
                                    <AdminIcon type="qr" />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`Approve ${vendor.name}`}
                                    onClick={() => handleVendorStatus(vendor._id, "approve")}
                                    disabled={vendor._id?.startsWith("V")}
                                  >
                                    <AdminIcon type="edit" />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`Reject ${vendor.name}`}
                                    onClick={() => handleVendorStatus(vendor._id, "reject")}
                                    disabled={vendor._id?.startsWith("V")}
                                  >
                                    <AdminIcon type="trash" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
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
              <>
                <section className="wallet-management-stats" aria-label="Wallet request statistics">
                  {[
                    ["Pending Requests", pendingWalletRequests, "orange"],
                    ["Approved Today", 12, "green"],
                    ["Total Added Today", "$1,850", ""],
                    ["Avg. Request", "$75.00", ""],
                  ].map(([label, value, tone]) => (
                    <article key={label}>
                      <span>{label}</span>
                      <strong className={tone}>{value}</strong>
                    </article>
                  ))}
                </section>

                <section className="wallet-management-section">
                  <h2>Add Money Requests</h2>
                  <div className="admin-table-wrap wallet-management-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Request ID</th>
                          <th>Student</th>
                          <th>Amount</th>
                          <th>Request Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {walletRequests.map((request) => (
                          <tr key={request.id}>
                            <td>{request.id}</td>
                            <td>
                              <div className="wallet-student-cell">
                                <strong>{request.student}</strong>
                                <span>{request.studentId}</span>
                              </div>
                            </td>
                            <td className="wallet-request-amount">{`$${Number(request.amount).toFixed(2)}`}</td>
                            <td>
                              <div className="wallet-date-cell">
                                <strong>{request.requestDate}</strong>
                                <span>{request.requestTime}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`wallet-request-status ${request.status}`}>
                                <AdminIcon
                                  type={
                                    request.status === "pending"
                                      ? "clock"
                                      : request.status === "approved"
                                        ? "check"
                                        : "x"
                                  }
                                />
                                {request.status}
                              </span>
                            </td>
                            <td>
                              {request.status === "pending" ? (
                                <div className="wallet-request-actions">
                                  <button
                                    className="approve"
                                    type="button"
                                    onClick={() => handleWalletRequestStatus(request.id, "approved")}
                                  >
                                    <AdminIcon type="check" />
                                    Approve
                                  </button>
                                  <button
                                    className="reject"
                                    type="button"
                                    onClick={() => handleWalletRequestStatus(request.id, "rejected")}
                                  >
                                    <AdminIcon type="x" />
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="wallet-no-action">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
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
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m15 18-6-6 6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </>
    ),
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
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" />
      </>
    ),
    qr: (
      <>
        <rect x="4" y="4" width="5" height="5" rx="1" />
        <rect x="15" y="4" width="5" height="5" rx="1" />
        <rect x="4" y="15" width="5" height="5" rx="1" />
        <path d="M15 15h2v2h-2z" />
        <path d="M20 15v5h-5" />
        <path d="M12 4v3" />
        <path d="M12 12h3" />
        <path d="M12 17v3" />
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
    trash: (
      <>
        <path d="M4 7h16" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M6 7l1 14h10l1-14" />
        <path d="M9 7V4h6v3" />
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
    x: (
      <>
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
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
