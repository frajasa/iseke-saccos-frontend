"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { getSession } from "next-auth/react";
import { GET_ATTACHMENTS, ADD_ATTACHMENT, DELETE_ATTACHMENT } from "@/lib/graphql/queries";
import { Upload, Trash2, FileText, Loader2, Paperclip, CheckCircle2, AlertCircle, Eye, Download, X, FileImage, File } from "lucide-react";

const DOCUMENT_TYPES = [
  { value: "PAYSLIP", label: "Payslip" },
  { value: "EMPLOYMENT_LETTER", label: "Employment Letter" },
  { value: "ID_COPY", label: "ID Copy" },
  { value: "CHECK_OFF_LETTER", label: "Check-off Letter" },
  { value: "BANK_STATEMENT", label: "Bank Statement" },
  { value: "PASSPORT_PHOTO", label: "Passport Photo" },
  { value: "COLLATERAL_DOCUMENT", label: "Collateral Document" },
  { value: "LOAN_APPLICATION_FORM", label: "Loan Application Form" },
  { value: "OTHER", label: "Other" },
];

interface AttachmentUploadProps {
  entityType: string;
  entityId: string;
  requiredTypes?: string[];
  title?: string;
}

function getFileViewUrl(filePath: string) {
  return `/api/files/view?path=${encodeURIComponent(filePath)}`;
}

function isImageFile(fileName: string) {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
}

function isPdfFile(fileName: string) {
  return /\.pdf$/i.test(fileName);
}

export default function AttachmentUpload({ entityType, entityId, requiredTypes, title }: AttachmentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("OTHER");
  const [error, setError] = useState("");
  const [previewFile, setPreviewFile] = useState<any>(null);

  const { data, refetch } = useQuery(GET_ATTACHMENTS, {
    variables: { entityType, entityId },
    errorPolicy: "all",
  });

  const [addAttachment] = useMutation(ADD_ATTACHMENT, {
    onCompleted: () => refetch(),
  });

  const [deleteAttachment] = useMutation(DELETE_ATTACHMENT, {
    onCompleted: () => refetch(),
  });

  const attachments = data?.attachments || [];

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      // Get auth token from session
      const session = await getSession();
      const token = (session as any)?.accessToken || "";

      // Upload file via Next.js API proxy (avoids CORS, forwards auth)
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/files/upload", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "File upload failed");
      }

      const result = await response.json();

      // Register attachment metadata via GraphQL
      await addAttachment({
        variables: {
          entityType,
          entityId,
          documentType: selectedDocType,
          filePath: result.filePath || result.path || file.name,
          fileName: file.name,
        },
      });
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }, [entityType, entityId, selectedDocType, addAttachment]);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this attachment?")) {
      await deleteAttachment({ variables: { id } });
    }
  };

  // Check which required types are satisfied
  const uploadedTypes = new Set(attachments.map((a: any) => a.documentType));
  const missingTypes = requiredTypes?.filter(t => !uploadedTypes.has(t)) || [];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">
            {title || "Documents & Attachments"}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({attachments.length})
          </span>
        </div>
        {missingTypes.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            {missingTypes.length} required doc(s) missing
          </span>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* Upload area */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            {DOCUMENT_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>{dt.label}</option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer shadow-sm">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Upload File"}
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Required documents checklist */}
        {requiredTypes && requiredTypes.length > 0 && (
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Required Documents</p>
            <div className="flex flex-wrap gap-2">
              {requiredTypes.map(type => (
                <span
                  key={type}
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border font-medium ${
                    uploadedTypes.has(type)
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {uploadedTypes.has(type) ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  {DOCUMENT_TYPES.find(d => d.value === type)?.label || type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Attachment list */}
        {attachments.length > 0 ? (
          <div className="space-y-2">
            {attachments.map((att: any) => (
              <div key={att.id} className="flex items-center justify-between p-3.5 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    {isImageFile(att.fileName) ? (
                      <FileImage className="w-4 h-4 text-primary" />
                    ) : (
                      <FileText className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{att.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {DOCUMENT_TYPES.find(d => d.value === att.documentType)?.label || att.documentType}
                      {att.fileSize && ` \u00B7 ${(att.fileSize / 1024).toFixed(0)} KB`}
                      {att.uploadedBy && ` \u00B7 by ${att.uploadedBy}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setPreviewFile(att)}
                    title="View document"
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a
                    href={getFileViewUrl(att.filePath)}
                    download={att.fileName}
                    title="Download"
                    className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(att.id)}
                    title="Delete"
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center">
              <Paperclip className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No documents attached yet</p>
            <p className="text-xs text-muted-foreground mt-1">Select a document type above and upload a file</p>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card rounded-xl border border-border shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  {isImageFile(previewFile.fileName) ? (
                    <FileImage className="w-5 h-5 text-primary" />
                  ) : (
                    <File className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{previewFile.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {DOCUMENT_TYPES.find(d => d.value === previewFile.documentType)?.label || previewFile.documentType}
                    {previewFile.uploadedBy && ` \u00B7 Uploaded by ${previewFile.uploadedBy}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getFileViewUrl(previewFile.filePath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Open
                </a>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto bg-muted/20 flex items-center justify-center p-4">
              {isImageFile(previewFile.fileName) ? (
                <img
                  src={getFileViewUrl(previewFile.filePath)}
                  alt={previewFile.fileName}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              ) : isPdfFile(previewFile.fileName) ? (
                <iframe
                  src={getFileViewUrl(previewFile.filePath)}
                  className="w-full h-[70vh] rounded-lg border border-border"
                  title={previewFile.fileName}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                    <File className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium mb-1">{previewFile.fileName}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Preview not available for this file type
                  </p>
                  <a
                    href={getFileViewUrl(previewFile.filePath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download to View
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
