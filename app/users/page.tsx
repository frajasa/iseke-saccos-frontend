"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  GET_ALL_USERS,
  CREATE_USER,
  UPDATE_USER,
  DEACTIVATE_USER,
  ACTIVATE_USER,
  DELETE_USER,
  RESET_PASSWORD
} from "@/lib/graphql/users";
import { GET_BRANCHES, GET_MEMBERS, GET_ACTIVE_ROLES } from "@/lib/graphql/queries";
import { Plus, Edit, Trash2, UserCheck, UserX, Key, ShieldAlert, X } from "lucide-react";
import { toast } from "sonner";
import ErrorDisplay from "@/components/ui/ErrorDisplay";

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  linkedMemberId?: string;
  branch?: {
    id: string;
    branchName: string;
  };
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createdUser, setCreatedUser] = useState<{ username: string; fullName: string } | null>(null);

  const user = session?.user as any;

  // All hooks must be called before any conditional returns
  const { data, loading, error, refetch } = useQuery(GET_ALL_USERS);
  const [createUser] = useMutation(CREATE_USER);
  const [updateUser] = useMutation(UPDATE_USER);
  const [deactivateUser] = useMutation(DEACTIVATE_USER);
  const [activateUser] = useMutation(ACTIVATE_USER);
  const [deleteUser] = useMutation(DELETE_USER);
  const [resetPassword] = useMutation(RESET_PASSWORD);

  // Check if user has permission (ADMIN or MANAGER only)
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (user && user.role !== "ADMIN" && user.role !== "MANAGER") {
      router.push("/dashboard");
    }
  }, [status, user, router]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not ADMIN or MANAGER
  if (user && user.role !== "ADMIN" && user.role !== "MANAGER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card rounded-xl border border-border shadow-lg max-w-md animate-scale-in">
          <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground mb-6">
            You don&apos;t have permission to access User Management.
            <br />
            Only ADMIN and MANAGER roles can access this page.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleCreateUser = async (formData: any) => {
    try {
      const result = await createUser({
        variables: { input: formData },
      });
      refetch();
      setShowCreateModal(false);
      const user = result.data?.createUser;
      if (user) {
        setCreatedUser({ username: user.username, fullName: user.fullName });
      }
    } catch (err: any) {
      console.error("Error creating user:", err);
      toast.error(err.message || "Failed to create user");
    }
  };

  const handleUpdateUser = async (formData: any) => {
    if (!selectedUser) return;

    try {
      await updateUser({
        variables: {
          id: selectedUser.id,
          input: formData
        },
      });
      refetch();
      setShowEditModal(false);
      setSelectedUser(null);
      toast.success("User updated successfully");
    } catch (err: any) {
      console.error("Error updating user:", err);
      toast.error(err.message || "Failed to update user");
    }
  };

  const handleToggleActive = async (targetUser: User) => {
    try {
      if (targetUser.isActive) {
        await deactivateUser({ variables: { id: targetUser.id } });
        toast.success("User deactivated");
      } else {
        await activateUser({ variables: { id: targetUser.id } });
        toast.success("User activated");
      }
      refetch();
    } catch (err: any) {
      console.error("Error toggling user status:", err);
      toast.error(err.message || "Failed to toggle user status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;

    try {
      await deleteUser({ variables: { id: userId } });
      refetch();
      toast.success("User deleted successfully");
    } catch (err: any) {
      console.error("Error deleting user:", err);
      toast.error(err.message || "Failed to delete user");
    }
  };

  const handleResetPassword = async (userId: string, newPassword: string) => {
    try {
      await resetPassword({
        variables: {
          id: userId,
          newPassword
        }
      });
      toast.success("Password reset successfully");
      setShowResetPasswordModal(false);
      setResetPasswordUserId(null);
    } catch (err: any) {
      console.error("Error resetting password:", err);
      toast.error(err.message || "Failed to reset password");
    }
  };

  if (loading) return <div className="p-6">Loading users...</div>;
  if (error) return <ErrorDisplay error={error} onRetry={() => refetch()} />;

  const users: User[] = data?.findAllUsers || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage system users and their access levels
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-hover text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
        >
          <Plus size={20} />
          Create User
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/30">
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Branch
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-foreground">{u.fullName}</div>
                    <div className="text-sm text-muted-foreground">@{u.username}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {u.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                    {u.role.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {u.branch?.branchName || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                      u.isActive
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`p-2 rounded-lg transition-colors ${
                        u.isActive
                          ? "text-accent hover:bg-accent/10"
                          : "text-success hover:bg-success/10"
                      }`}
                      title={u.isActive ? "Deactivate" : "Activate"}
                    >
                      {u.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                    </button>
                    <button
                      onClick={() => {
                        setResetPasswordUserId(u.id);
                        setShowResetPasswordModal(true);
                      }}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Reset Password"
                    >
                      <Key size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <UserFormModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {showEditModal && selectedUser && (
        <UserFormModal
          mode="edit"
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleUpdateUser}
        />
      )}

      {showResetPasswordModal && resetPasswordUserId && (
        <ResetPasswordModal
          onClose={() => {
            setShowResetPasswordModal(false);
            setResetPasswordUserId(null);
          }}
          onSubmit={(newPassword) => handleResetPassword(resetPasswordUserId, newPassword)}
        />
      )}

      {createdUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl max-w-md w-full p-6 shadow-xl border border-border animate-scale-in">
            <div className="text-center">
              <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-7 h-7 text-success" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">User Created Successfully!</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Account for <span className="font-semibold text-foreground">{createdUser.fullName}</span> has been created.
              </p>

              <div className="bg-muted/50 rounded-lg p-4 mb-5 text-left space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Username:</span>
                  <span className="text-sm font-bold text-foreground font-mono">{createdUser.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Login URL:</span>
                  <a
                    href={`${window.location.origin}/login`}
                    className="text-sm font-medium text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {window.location.origin}/login
                  </a>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-5">
                Please share these credentials with the user securely. They will be required to change their password on first login.
              </p>

              <button
                onClick={() => setCreatedUser(null)}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface UserFormModalProps {
  mode: "create" | "edit";
  user?: User;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function UserFormModal({ mode, user, onClose, onSubmit }: UserFormModalProps) {
  const { data: branchesData } = useQuery(GET_BRANCHES);
  const { data: rolesData } = useQuery(GET_ACTIVE_ROLES);
  const { data: membersData } = useQuery(GET_MEMBERS, {
    variables: { page: 0, size: 1000, status: "ACTIVE" },
  });
  const branches = branchesData?.branches || [];
  const members = membersData?.members?.content || [];

  const [formData, setFormData] = useState({
    username: user?.username || "",
    firstName: user?.firstName || "",
    middleName: user?.middleName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    role: user?.role || "CASHIER",
    branchId: user?.branch?.id || "",
    linkedMemberId: user?.linkedMemberId || "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create") {
      if (!formData.password || formData.password !== formData.confirmPassword) {
        toast.error("Passwords don't match");
        return;
      }
      if (formData.role === "MEMBER" && !formData.linkedMemberId) {
        toast.error("Please select a member to link for MEMBER role");
        return;
      }
      onSubmit({
        ...formData,
        username: formData.username.trim() || undefined,
        linkedMemberId: formData.linkedMemberId || undefined,
        branchId: formData.branchId || undefined,
      });
    } else {
      const { password, confirmPassword, username, ...updateData } = formData;
      onSubmit({
        ...updateData,
        linkedMemberId: updateData.linkedMemberId || undefined,
        branchId: updateData.branchId || undefined,
      });
    }
  };

  const inputClass = "block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-xl border border-border">
        <h2 className="text-2xl font-bold text-primary mb-6">
          {mode === "create" ? "Create New User" : "Edit User"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username (create only) */}
          {mode === "create" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Username</label>
              <input
                type="text"
                placeholder={formData.firstName && formData.lastName
                  ? `Auto: ${formData.firstName.charAt(0).toLowerCase()}${formData.lastName.toLowerCase().replace(/[^a-z]/g, "")}`
                  : "Leave blank to auto-generate"}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={inputClass}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank to auto-generate from name (e.g., first initial + last name)
              </p>
            </div>
          )}

          {/* Name Fields - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">First Name *</label>
              <input
                type="text"
                required
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Middle Name</label>
              <input
                type="text"
                placeholder="Optional"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Last Name *</label>
              <input
                type="text"
                required
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Email and Phone - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+255 XXX XXX XXX"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Role and Branch - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Role *</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={inputClass}
              >
                {(rolesData?.activeRoles || []).map((r: any) => (
                  <option key={r.id} value={r.name}>{r.displayName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Branch</label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                className={inputClass}
              >
                <option value="">Select Branch</option>
                {branches.map((branch: any) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linked Member (shown when role is MEMBER) */}
          {formData.role === "MEMBER" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Link to Member *</label>
              <select
                required
                value={formData.linkedMemberId}
                onChange={(e) => {
                  const memberId = e.target.value;
                  const member = memberId && mode === "create"
                    ? members.find((m: any) => m.id === memberId)
                    : null;
                  setFormData((prev) => ({
                    ...prev,
                    linkedMemberId: memberId,
                    ...(member ? {
                      firstName: member.firstName || prev.firstName,
                      middleName: member.middleName || prev.middleName,
                      lastName: member.lastName || prev.lastName,
                      email: member.email || prev.email,
                      phoneNumber: member.phoneNumber || prev.phoneNumber,
                    } : {}),
                  }));
                }}
                className={inputClass}
              >
                <option value="">Select a Member</option>
                {members.map((member: any) => (
                  <option key={member.id} value={member.id}>
                    {member.memberNumber} - {member.firstName} {member.lastName}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                This links the user account to a SACCOS member for self-service portal access.
              </p>
            </div>
          )}

          {/* Password Fields - 2 columns (only for create mode) */}
          {mode === "create" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={inputClass}
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={inputClass}
                  minLength={8}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
            >
              {mode === "create" ? "Create User" : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (newPassword: string) => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    onSubmit(newPassword);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl max-w-md w-full p-6 shadow-xl border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary">Reset Password</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              New Password *
            </label>
            <input
              type="password"
              required
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError("");
              }}
              className="block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              className="block w-full rounded-md border border-input bg-background text-foreground px-3 py-2 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              minLength={8}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
