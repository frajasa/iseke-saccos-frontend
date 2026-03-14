"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ALL_MEMBER_CUSTOM_FIELDS, CREATE_MEMBER_CUSTOM_FIELD, UPDATE_MEMBER_CUSTOM_FIELD, DELETE_MEMBER_CUSTOM_FIELD } from "@/lib/graphql/queries";
import { MemberCustomField } from "@/lib/types";
import { isNullListError } from "@/lib/error-utils";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

const FIELD_TYPES = ["TEXT", "NUMBER", "DATE", "DROPDOWN", "CHECKBOX"];

export default function CustomFieldsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState("TEXT");
  const [options, setOptions] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  const { data, loading, error, refetch } = useQuery(GET_ALL_MEMBER_CUSTOM_FIELDS);

  const [createField, { loading: creating }] = useMutation(CREATE_MEMBER_CUSTOM_FIELD, {
    onCompleted: () => {
      setShowCreateModal(false);
      resetForm();
      refetch();
    },
  });

  const [updateField] = useMutation(UPDATE_MEMBER_CUSTOM_FIELD, {
    onCompleted: () => refetch(),
  });

  const [deleteField] = useMutation(DELETE_MEMBER_CUSTOM_FIELD, {
    onCompleted: () => refetch(),
  });

  const fields: MemberCustomField[] = data?.allMemberCustomFields || [];

  const resetForm = () => {
    setFieldName("");
    setFieldLabel("");
    setFieldType("TEXT");
    setOptions("");
    setIsRequired(false);
    setSortOrder(0);
  };

  const handleCreate = () => {
    if (!fieldName || !fieldLabel) return;
    createField({
      variables: {
        fieldName,
        fieldLabel,
        fieldType,
        options: options || null,
        isRequired,
        sortOrder,
      },
    });
  };

  const handleToggleActive = (field: MemberCustomField) => {
    updateField({ variables: { id: field.id, isActive: !field.isActive } });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this custom field?")) {
      deleteField({ variables: { id } });
    }
  };

  if (error && !isNullListError(error)) return <ErrorDisplay error={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Member Custom Fields</h1>
          <p className="text-sm text-muted-foreground">Define additional member information fields</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
        >
          Add Custom Field
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading fields...</div>
      ) : fields.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No custom fields defined yet</div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Order</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Field Name</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Label</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Options</th>
                <th className="text-center px-5 py-3 font-medium text-muted-foreground">Required</th>
                <th className="text-center px-5 py-3 font-medium text-muted-foreground">Active</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.id} className="border-t border-border">
                  <td className="px-5 py-3 text-foreground">{field.sortOrder}</td>
                  <td className="px-5 py-3 font-mono text-foreground text-xs">{field.fieldName}</td>
                  <td className="px-5 py-3 text-foreground">{field.fieldLabel}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {field.fieldType}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-xs max-w-[200px] truncate">{field.options || "-"}</td>
                  <td className="px-5 py-3 text-center">{field.isRequired ? "Yes" : "No"}</td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => handleToggleActive(field)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        field.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {field.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDelete(field.id)}
                      className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Create Custom Field</h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Field Name (key)</label>
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value.replace(/\s/g, "_").toUpperCase())}
                placeholder="e.g. NEXT_OF_KIN_NAME"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Display Label</label>
              <input
                type="text"
                value={fieldLabel}
                onChange={(e) => setFieldLabel(e.target.value)}
                placeholder="e.g. Next of Kin Name"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Field Type</label>
              <select
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {fieldType === "DROPDOWN" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Options (comma separated)</label>
                <input
                  type="text"
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                  placeholder="e.g. Option1,Option2,Option3"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                />
              </div>
            )}

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isRequired" className="text-sm text-foreground">Required</label>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-1">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !fieldName || !fieldLabel}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Field"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
