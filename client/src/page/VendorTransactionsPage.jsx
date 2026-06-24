import { useEffect, useMemo, useRef, useState } from "react";
import { vendorTransactions } from "./VendorDashboardData";
import { Icon } from "./VendorIcon";

const transactionFilterOptions = [
  { label: "Last 3 Days", value: 3, unit: "days" },
  { label: "Last 7 Days", value: 7, unit: "days" },
  { label: "Last 15 Days", value: 15, unit: "days" },
  { label: "Last 1 Month", value: 1, unit: "months" },
];

const getTransactionDate = (transaction) => new Date(`${transaction.date} ${transaction.time}`);

const escapePdfText = (value) => String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const createPdfBlob = (title, rows) => {
  const pageHeight = 842;
  const lines = [
    title,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    ...rows,
  ];

  const content = [
    "BT",
    "/F1 18 Tf",
    "50 792 Td",
    `(${escapePdfText(lines[0])}) Tj`,
    "/F1 11 Tf",
    ...lines.slice(1).flatMap((line) => ["0 -20 Td", `(${escapePdfText(line)}) Tj`]),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 ${pageHeight}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
};

const getTransactionPdfRows = (items) =>
  items.flatMap((transaction) => [
    `Transaction ID: ${transaction.id}`,
    `Customer: ${transaction.customer} (${transaction.customerId})`,
    `Amount: ${transaction.amount}`,
    `Date & Time: ${transaction.date} ${transaction.time}`,
    `Status: ${transaction.status}`,
    "",
  ]);

const getFilterCutoffDate = (selectedFilter, currentDate) => {
  const cutoffDate = new Date(currentDate);

  if (selectedFilter.unit === "months") {
    cutoffDate.setMonth(cutoffDate.getMonth() - selectedFilter.value);
  } else {
    cutoffDate.setDate(cutoffDate.getDate() - selectedFilter.value);
  }

  cutoffDate.setHours(0, 0, 0, 0);
  return cutoffDate;
};

const filterTransactionsByPeriod = (items, selectedFilter, currentDate = new Date()) => {
  if (!selectedFilter) {
    return items;
  }

  const cutoffDate = getFilterCutoffDate(selectedFilter, currentDate);

  return items.filter((transaction) => {
    const transactionDate = getTransactionDate(transaction);
    return !Number.isNaN(transactionDate.getTime()) && transactionDate >= cutoffDate;
  });
};

function VendorTransactionsPage() {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dateFilteredTransactions = useMemo(
    () => filterTransactionsByPeriod(vendorTransactions, selectedFilter),
    [selectedFilter]
  );

  const visibleTransactions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return dateFilteredTransactions;
    }

    return dateFilteredTransactions.filter((transaction) =>
      transaction.id.toLowerCase().includes(normalizedQuery)
    );
  }, [dateFilteredTransactions, searchQuery]);

  const handleFilterSelect = (option) => {
    setSelectedFilter(option);
    setIsFilterOpen(false);
  };

  const handleExport = () => {
    const rangeLabel = selectedFilter?.label || "All Transactions";
    const rows = dateFilteredTransactions.length
      ? getTransactionPdfRows(dateFilteredTransactions)
      : ["No transactions found for selected period."];
    const blob = createPdfBlob(`Vendor Transaction History - ${rangeLabel}`, rows);
    downloadBlob(blob, `vendor-transactions-${rangeLabel.toLowerCase().replaceAll(" ", "-")}.pdf`);
  };

  const emptyMessage = selectedFilter
    ? "No transactions found for selected period."
    : "No transactions found.";

  return (
    <>
      <section className="vendor-stats-grid vendor-transaction-stats" aria-label="Vendor transaction statistics">
        <article>
          <span>Today's Revenue</span>
          <strong>$236.25</strong>
        </article>
        <article>
          <span>This Week</span>
          <strong>$1,450.00</strong>
        </article>
        <article>
          <span>This Month</span>
          <strong>$4,820.00</strong>
        </article>
        <article>
          <span>Total Transactions</span>
          <strong>342</strong>
        </article>
      </section>

      <section className="vendor-transaction-page" aria-label="Vendor transactions">
        <div className="vendor-transaction-tools">
          <form className="vendor-transaction-search" onSubmit={(e) => e.preventDefault()}>
            <Icon type="search" />
            <input
              type="search"
              placeholder="Search by transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="vendor-date-filter-menu" ref={dropdownRef}>
            <button
              className={`vendor-date-button${isFilterOpen ? " active" : ""}`}
              type="button"
              onClick={() => setIsFilterOpen((isOpen) => !isOpen)}
            >
              <Icon type="calendar" />
              {selectedFilter ? `Date Range: ${selectedFilter.label}` : "Date Range"}
            </button>
            {isFilterOpen && (
              <div className="vendor-date-dropdown" role="menu">
                {transactionFilterOptions.map((option) => (
                  <button
                    className={selectedFilter?.label === option.label ? "selected" : ""}
                    key={option.label}
                    type="button"
                    role="menuitem"
                    onClick={() => handleFilterSelect(option)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="vendor-export-button" type="button" onClick={handleExport}>
            <Icon type="download" />
            Export
          </button>
        </div>

        <div className="vendor-transactions-table vendor-full-transactions-table">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleTransactions.length ? (
                visibleTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>
                      <strong>{transaction.customer}</strong>
                      <span>{transaction.customerId}</span>
                    </td>
                    <td>{transaction.amount}</td>
                    <td>
                      {transaction.date}
                      <span>{transaction.time}</span>
                    </td>
                    <td>
                      <span className="vendor-status-pill">{transaction.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "#7c8497", padding: "24px 0" }}>
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

export default VendorTransactionsPage;
