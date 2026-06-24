import { useMemo, useState } from "react";
import { transactions } from "./StudentDashboardData";
import { Icon } from "./StudentIcon";
import StudentHeader from "./StudentHeader";

const transactionFilterOptions = [
  { label: "Last 7 Days", value: 7, unit: "days" },
  { label: "Last 15 Days", value: 15, unit: "days" },
  { label: "Last 1 Month", value: 1, unit: "months" },
  { label: "Last 3 Months", value: 3, unit: "months" },
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
    `Vendor/Description: ${transaction.vendor}`,
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

function StudentTransactionsPage({ student, onLogout }) {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dateFilteredTransactions = useMemo(
    () => filterTransactionsByPeriod(transactions, selectedFilter),
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
    const blob = createPdfBlob(`Transaction History - ${rangeLabel}`, rows);
    downloadBlob(blob, `transactions-${rangeLabel.toLowerCase().replaceAll(" ", "-")}.pdf`);
  };

  const handleReceiptDownload = (transaction) => {
    const blob = createPdfBlob(`Transaction Receipt - ${transaction.id}`, getTransactionPdfRows([transaction]));
    downloadBlob(blob, `receipt-${transaction.id.toLowerCase()}.pdf`);
  };

  const emptyMessage = selectedFilter
    ? "No transactions found for selected period."
    : "No transactions found.";

  return (
    <section className="transaction-history-view" aria-label="Transaction history">
      <StudentHeader
        title="Transaction History"
        student={student}
        onLogout={onLogout}
      />

      <div className="history-tools">
        <form className="history-search" onSubmit={(event) => event.preventDefault()}>
          <Icon type="search" />
          <input
            type="search"
            placeholder="Search by transaction ID..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </form>
        <div className="history-filter-menu">
          <button
            className={`history-tool-button${isFilterOpen ? " active" : ""}`}
            type="button"
            aria-expanded={isFilterOpen}
            aria-haspopup="menu"
            onClick={() => setIsFilterOpen((isOpen) => !isOpen)}
          >
            <Icon type="filter" />
            {selectedFilter ? `Date Range: ${selectedFilter.label}` : "Date Range"}
          </button>
          {isFilterOpen && (
            <div className="history-filter-dropdown" role="menu">
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
        <button className="history-export-button" type="button" onClick={handleExport}>
          <Icon type="download" />
          Export
        </button>
      </div>

      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Vendor/Description</th>
              <th>Amount</th>
              <th>Date &amp; Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleTransactions.length ? (
              visibleTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.vendor}</td>
                  <td className={transaction.amount.startsWith("+") ? "positive" : ""}>
                    {transaction.amount}
                  </td>
                  <td>
                    {transaction.date}
                    <span>{transaction.time}</span>
                  </td>
                  <td>
                    <span className="status-pill">{transaction.status}</span>
                  </td>
                  <td>
                    <button
                      className="receipt-button"
                      type="button"
                      onClick={() => handleReceiptDownload(transaction)}
                    >
                      <Icon type="download" />
                      Receipt
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="history-empty-message" colSpan="6">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default StudentTransactionsPage;
