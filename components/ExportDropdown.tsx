"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";

interface ExportDropdownProps {
  onExport: (format: "excel" | "pdf" | "print") => void;
  disabled?: boolean;
}

export default function ExportDropdown({
  onExport,
  disabled,
}: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              onExport("excel");
              setOpen(false);
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            Export to Excel
          </button>
          <button
            onClick={() => {
              onExport("pdf");
              setOpen(false);
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FileText className="w-4 h-4 text-red-600" />
            Export to PDF
          </button>
          <button
            onClick={() => {
              onExport("print");
              setOpen(false);
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            Print Report
          </button>
        </div>
      )}
    </div>
  );
}
