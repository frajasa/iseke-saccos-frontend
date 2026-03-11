"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_ROLES,
  GET_PERMISSIONS,
  CREATE_ROLE,
  UPDATE_ROLE,
  DELETE_ROLE,
  ASSIGN_PERMISSIONS,
} from "@/lib/graphql/queries";
import { Role, Permission } from "@/lib/types";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Shield, ChevronDown, ChevronRight, Check } from "lucide-react";

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", displayName: "", description: "" });
  const [editForm, setEditForm] = useState({ displayName: "", description: "", isActive: true });
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const { data: rolesData, loading: rolesLoading, refetch: refetchRoles } = useQuery(GET_ROLES);
  const { data: permsData } = useQuery(GET_PERMISSIONS);

  const [createRole] = useMutation(CREATE_ROLE, {
    onCompleted: () => { toast.success("Role created"); refetchRoles(); setShowCreate(false); setCreateForm({ name: "", displayName: "", description: "" }); },
    onError: (err) => toast.error(err.message),
  });
  const [updateRole] = useMutation(UPDATE_ROLE, {
    onCompleted: () => { toast.success("Role updated"); refetchRoles(); setShowEdit(false); },
    onError: (err) => toast.error(err.message),
  });
  const [deleteRole] = useMutation(DELETE_ROLE, {
    onCompleted: () => { toast.success("Role deleted"); refetchRoles(); setSelectedRole(null); },
    onError: (err) => toast.error(err.message),
  });
  const [assignPermissions] = useMutation(ASSIGN_PERMISSIONS, {
    onCompleted: () => { toast.success("Permissions updated"); refetchRoles(); },
    onError: (err) => toast.error(err.message),
  });

  const roles: Role[] = rolesData?.roles || [];
  const allPermissions: Permission[] = permsData?.permissions || [];

  // Group permissions by module
  const permissionsByModule = allPermissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  const modules = Object.keys(permissionsByModule).sort();

  const toggleModule = (module: string) => {
    const next = new Set(expandedModules);
    if (next.has(module)) next.delete(module);
    else next.add(module);
    setExpandedModules(next);
  };

  const selectedPermissionIds = new Set(selectedRole?.permissions?.map((p) => p.id) || []);

  const togglePermission = (permId: string) => {
    if (!selectedRole) return;
    const next = new Set(selectedPermissionIds);
    if (next.has(permId)) next.delete(permId);
    else next.add(permId);
    assignPermissions({ variables: { roleId: selectedRole.id, permissionIds: Array.from(next) } });
  };

  const toggleModulePermissions = (module: string) => {
    if (!selectedRole) return;
    const modulePerms = permissionsByModule[module] || [];
    const allSelected = modulePerms.every((p) => selectedPermissionIds.has(p.id));
    const next = new Set(selectedPermissionIds);
    if (allSelected) {
      modulePerms.forEach((p) => next.delete(p.id));
    } else {
      modulePerms.forEach((p) => next.add(p.id));
    }
    assignPermissions({ variables: { roleId: selectedRole.id, permissionIds: Array.from(next) } });
  };

  const startEdit = (role: Role) => {
    setEditForm({ displayName: role.displayName, description: role.description || "", isActive: role.isActive });
    setShowEdit(true);
  };

  if (rolesLoading) return <div className="p-8"><div className="animate-pulse text-muted-foreground">Loading roles...</div></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage user roles and assign granular permissions</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
          <Plus className="w-4 h-4" /> New Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/50">
            <h3 className="font-semibold text-sm">Roles ({roles.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => { setSelectedRole(role); setExpandedModules(new Set()); }}
                className={`px-4 py-3 cursor-pointer transition-colors ${selectedRole?.id === role.id ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-muted/30"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className={`w-4 h-4 ${role.isSystemRole ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-semibold text-sm">{role.displayName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 ml-6">{role.permissions?.length || 0} permissions</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {role.isSystemRole && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">System</span>
                    )}
                    {!role.isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium">Inactive</span>
                    )}
                  </div>
                </div>
                {role.description && (
                  <p className="text-xs text-muted-foreground mt-1 ml-6 line-clamp-1">{role.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Panel */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          {selectedRole ? (
            <>
              <div className="px-4 py-3 border-b border-border bg-muted/50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{selectedRole.displayName} - Permissions</h3>
                  <p className="text-xs text-muted-foreground">{selectedRole.permissions?.length || 0} of {allPermissions.length} permissions assigned</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(selectedRole)} className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted flex items-center gap-1">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  {!selectedRole.isSystemRole && (
                    <button
                      onClick={() => { if (confirm("Delete this role?")) deleteRole({ variables: { id: selectedRole.id } }); }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
                {modules.map((module) => {
                  const modulePerms = permissionsByModule[module];
                  const selectedCount = modulePerms.filter((p) => selectedPermissionIds.has(p.id)).length;
                  const allSelected = selectedCount === modulePerms.length;
                  const someSelected = selectedCount > 0 && !allSelected;
                  const isExpanded = expandedModules.has(module);

                  return (
                    <div key={module} className="border border-border rounded-lg overflow-hidden">
                      <div
                        className="flex items-center justify-between px-4 py-2.5 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleModule(module)}
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                          <span className="font-semibold text-sm">{module.replace(/_/g, " ")}</span>
                          <span className="text-xs text-muted-foreground">({selectedCount}/{modulePerms.length})</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleModulePermissions(module); }}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            allSelected
                              ? "bg-primary text-white border-primary"
                              : someSelected
                              ? "bg-primary/20 text-primary border-primary/30"
                              : "bg-background text-muted-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {allSelected ? "Deselect All" : "Select All"}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="px-4 py-2 space-y-1.5">
                          {modulePerms.map((perm) => {
                            const isSelected = selectedPermissionIds.has(perm.id);
                            return (
                              <label
                                key={perm.id}
                                className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                              >
                                <div
                                  onClick={() => togglePermission(perm.id)}
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                                    isSelected ? "bg-primary border-primary text-white" : "border-border bg-background"
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3" />}
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{perm.displayName}</div>
                                  {perm.description && <div className="text-xs text-muted-foreground">{perm.description}</div>}
                                </div>
                                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{perm.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Select a role to manage permissions</p>
              <p className="text-sm mt-1">Click on a role from the list to view and edit its permissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowCreate(false)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Create New Role</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Role Name (internal)</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
                  placeholder="e.g. BRANCH_SUPERVISOR"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Display Name</label>
                <input
                  type="text"
                  value={createForm.displayName}
                  onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  placeholder="e.g. Branch Supervisor"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  rows={2}
                  placeholder="What does this role do?"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
              <button
                onClick={() => createRole({ variables: createForm })}
                disabled={!createForm.name || !createForm.displayName}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEdit && selectedRole && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowEdit(false)}>
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Edit Role - {selectedRole.name}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Display Name</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  rows={2}
                />
              </div>
              {!selectedRole.isSystemRole && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Active</span>
                </label>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowEdit(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
              <button
                onClick={() => updateRole({ variables: { id: selectedRole.id, ...editForm } })}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
