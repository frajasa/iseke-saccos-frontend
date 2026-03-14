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

// ===== LOGO =====

const LOGO_PATH = "/logo.png";
const ORG_NAME = "iSACCOS";
const ORG_TAGLINE = "Empowering Financial Growth";

/**
 * Load logo as base64 data URL for embedding in exports.
 * Returns null if the logo can't be loaded.
 */
async function loadLogoBase64(): Promise<string | null> {
  try {
    const response = await fetch(LOGO_PATH);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
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

export async function exportToExcel(options: ExportOptions) {
  const { title, subtitle, filename, columns, data, summary } = options;

  const wsData: any[][] = [];

  // Leave rows for logo area
  wsData.push([]); // row 0: logo placeholder
  wsData.push([ORG_NAME]);
  wsData.push([ORG_TAGLINE]);
  wsData.push([]); // blank row

  // Report header
  wsData.push([title]);
  if (subtitle) wsData.push([subtitle]);
  wsData.push([`Generated: ${new Date().toLocaleString()}`]);
  wsData.push([]); // blank row

  // Column headers
  const headerRowIndex = wsData.length;
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

  // Row heights for logo area
  ws["!rows"] = [
    { hpt: 40 }, // row 0: logo space
    { hpt: 20 }, // row 1: org name
    { hpt: 15 }, // row 2: tagline
  ];

  // Merge header rows across all columns
  const lastCol = Math.max(columns.length - 1, 0);
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } }, // logo row
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } }, // org name
    { s: { r: 2, c: 0 }, e: { r: 2, c: lastCol } }, // tagline
    { s: { r: 4, c: 0 }, e: { r: 4, c: lastCol } }, // title
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}.xlsx`);
}

// ===== PDF EXPORT =====

export async function exportToPDF(options: ExportOptions) {
  const { title, subtitle, filename, columns, data, summary, orientation } =
    options;

  const doc = new jsPDF({
    orientation: orientation || "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 10;

  // Add logo
  const logoBase64 = await loadLogoBase64();
  if (logoBase64) {
    const logoWidth = 18;
    const logoHeight = 18;
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(logoBase64, "PNG", logoX, yPos, logoWidth, logoHeight);
    yPos += logoHeight + 2;
  }

  // Organization name
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 59, 115); // Navy Blue
  doc.text(ORG_NAME, pageWidth / 2, yPos, { align: "center" });
  yPos += 5;

  // Tagline
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 135, 81); // Green
  doc.text(ORG_TAGLINE, pageWidth / 2, yPos, { align: "center" });
  yPos += 4;

  // Divider line
  doc.setDrawColor(0, 59, 115);
  doc.setLineWidth(0.5);
  doc.line(10, yPos, pageWidth - 10, yPos);
  yPos += 6;

  // Report Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(title, pageWidth / 2, yPos, { align: "center" });
  yPos += 6;

  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(subtitle, pageWidth / 2, yPos, { align: "center" });
    yPos += 5;
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
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | ${ORG_NAME} - ${ORG_TAGLINE}`,
      pageWidth / 2,
      pageH - 8,
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
        .print-header {
          text-align: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid #003B73;
        }
        .print-header img {
          width: 60px;
          height: 60px;
          object-fit: contain;
          margin-bottom: 4px;
        }
        .print-header .org-name {
          font-size: 20px;
          font-weight: 700;
          color: #003B73;
          margin: 0;
        }
        .print-header .org-tagline {
          font-size: 11px;
          color: #008751;
          margin: 0 0 2px 0;
        }
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
      <div class="print-header">
        <img src="${LOGO_PATH}" alt="${ORG_NAME}" />
        <p class="org-name">${ORG_NAME}</p>
        <p class="org-tagline">${ORG_TAGLINE}</p>
      </div>
      ${printContent.innerHTML}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
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
      exportToExcel(options).catch(console.error);
      break;
    case "pdf":
      exportToPDF(options).catch(console.error);
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
