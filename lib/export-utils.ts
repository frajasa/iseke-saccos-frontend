import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ===== TYPES =====

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  format?: "currency" | "date" | "percent" | "number";
}

export interface ExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
  summary?: { label: string; value: string }[];
  orientation?: "portrait" | "landscape";
}

// ===== CURRENCY / FORMAT HELPERS =====

function formatValue(value: any, format?: string): string {
  if (value == null) return "";
  if (format === "currency") {
    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) return String(value);
    return new Intl.NumberFormat("en-TZ", {
      style: "currency",
      currency: "TZS",
      minimumFractionDigits: 2,
    }).format(num);
  }
  if (format === "percent") {
    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) return String(value);
    return `${num.toFixed(2)}%`;
  }
  if (format === "date") {
    if (!value) return "";
    return new Date(value).toLocaleDateString("en-GB");
  }
  if (format === "number") {
    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) return String(value);
    return num.toLocaleString();
  }
  return String(value);
}

// ===== EXCEL EXPORT =====

export function exportToExcel(options: ExportOptions) {
  const { title, subtitle, filename, columns, data, summary } = options;

  const wsData: any[][] = [];

  // Header rows
  wsData.push([title]);
  if (subtitle) wsData.push([subtitle]);
  wsData.push([`Generated: ${new Date().toLocaleString()}`]);
  wsData.push([]); // blank row

  // Column headers
  wsData.push(columns.map((c) => c.header));

  // Data rows
  data.forEach((row) => {
    wsData.push(
      columns.map((c) => {
        const val = row[c.key];
        if (c.format === "currency" || c.format === "number") {
          const num = typeof val === "number" ? val : parseFloat(val);
          return isNaN(num) ? val : num;
        }
        if (c.format === "date" && val) {
          return new Date(val).toLocaleDateString("en-GB");
        }
        return val ?? "";
      })
    );
  });

  // Summary rows
  if (summary && summary.length > 0) {
    wsData.push([]);
    summary.forEach((s) => wsData.push([s.label, s.value]));
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = columns.map((c) => ({ wch: c.width || 18 }));

  // Merge title row
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}.xlsx`);
}

// ===== PDF EXPORT =====

export function exportToPDF(options: ExportOptions) {
  const { title, subtitle, filename, columns, data, summary, orientation } =
    options;

  const doc = new jsPDF({
    orientation: orientation || "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, 15, { align: "center" });

  // Subtitle
  let yPos = 22;
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, pageWidth / 2, yPos, { align: "center" });
    yPos += 6;
  }

  // Generated date
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, {
    align: "center",
  });
  doc.setTextColor(0);
  yPos += 6;

  // Table
  const headers = columns.map((c) => c.header);
  const body = data.map((row) =>
    columns.map((c) => formatValue(row[c.key], c.format))
  );

  autoTable(doc, {
    head: [headers],
    body,
    startY: yPos,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: {
      fillColor: [0, 59, 115], // Navy Blue #003B73
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 10, right: 10 },
  });

  // Summary after table
  if (summary && summary.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || yPos + 20;
    let sy = finalY + 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    summary.forEach((s) => {
      doc.text(`${s.label}: ${s.value}`, 12, sy);
      sy += 5;
    });
  }

  // Footer with page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | ISEKE SACCOS`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  doc.save(`${filename}.pdf`);
}

// ===== PRINT =====

export function printReport(elementId: string) {
  const printContent = document.getElementById(elementId);
  if (!printContent) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #1a1a1a; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; font-size: 11px; }
        th { background-color: #003B73; color: white; font-weight: 600; }
        tr:nth-child(even) { background-color: #f9fafb; }
        h1 { font-size: 18px; text-align: center; margin-bottom: 4px; color: #003B73; }
        h2 { font-size: 13px; text-align: center; color: #6b7280; margin-bottom: 10px; }
        .summary { margin-top: 15px; font-size: 12px; }
        .summary dt { font-weight: 600; display: inline; }
        .summary dd { display: inline; margin-right: 20px; }
        @media print {
          body { padding: 0; }
          @page { margin: 15mm; }
        }
      </style>
    </head>
    <body>
      ${printContent.innerHTML}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

// ===== CONVENIENCE: COMBINED EXPORT DROPDOWN COMPONENT DATA =====

export type ExportFormat = "excel" | "pdf" | "print";

export function handleExport(
  format: ExportFormat,
  options: ExportOptions,
  printElementId?: string
) {
  switch (format) {
    case "excel":
      exportToExcel(options);
      break;
    case "pdf":
      exportToPDF(options);
      break;
    case "print":
      if (printElementId) {
        printReport(printElementId);
      } else {
        window.print();
      }
      break;
  }
}
