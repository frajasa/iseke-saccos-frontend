"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CreditCard,
  ArrowLeftRight,
  ArrowRightLeft,
  Building2,
  LogOut,
  Menu,
  X,
  Calculator,
  UserCog,
  Smartphone,
  Factory,
  Receipt,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Lock,
  Coins,
  ShieldCheck,
  Clock,
  Upload,
  Printer,
  TrendingUp,
  UsersRound,
  FileCheck,
  Timer,
  PiggyBank,
  HandCoins,
  CalendarRange,
  UserCheck,
  Banknote,
  DollarSign,
  GitBranch,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Shield, Package, PieChart, Target, UserPlus, BarChart3, ShieldPlus, FormInput } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Each nav item requires at least one of the listed permissions to be visible
const navigation = [
  {
    label: "MAIN",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permissions: ["VIEW_DASHBOARD"], roles: ["ADMIN", "MANAGER", "CASHIER", "LOAN_OFFICER", "ACCOUNTANT"] },
      { name: "Members", href: "/members", icon: Users, permissions: ["VIEW_MEMBERS"], roles: ["ADMIN", "MANAGER", "CASHIER", "LOAN_OFFICER"] },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { name: "Savings", href: "/savings", icon: Wallet, permissions: ["VIEW_SAVINGS"], roles: ["ADMIN", "MANAGER", "CASHIER"] },
      { name: "Loans", href: "/loans", icon: CreditCard, permissions: ["VIEW_LOANS"], roles: ["ADMIN", "MANAGER", "LOAN_OFFICER"] },
      { name: "Transactions", href: "/transactions", icon: ArrowLeftRight, permissions: ["VIEW_TRANSACTIONS"], roles: ["ADMIN", "MANAGER", "CASHIER", "ACCOUNTANT"] },
      { name: "Transfer", href: "/transactions/transfer", icon: ArrowRightLeft, permissions: ["TRANSFER_ACCOUNTS"], roles: ["ADMIN", "MANAGER", "CASHIER"] },
      { name: "Payments", href: "/dashboard/payments", icon: Smartphone, permissions: ["VIEW_PAYMENTS"], roles: ["ADMIN", "MANAGER", "CASHIER"] },
      { name: "Group Savings", href: "/dashboard/group-savings", icon: UsersRound, permissions: ["VIEW_SAVINGS", "MANAGE_SAVINGS"], roles: ["ADMIN", "MANAGER", "CASHIER"] },
      { name: "Check Register", href: "/dashboard/check-register", icon: FileCheck, permissions: ["VIEW_SAVINGS", "MANAGE_SAVINGS"], roles: ["ADMIN", "MANAGER", "CASHIER"] },
      { name: "Term Deposits", href: "/dashboard/term-deposits", icon: Timer, permissions: ["VIEW_SAVINGS", "MANAGE_SAVINGS"], roles: ["ADMIN", "MANAGER"] },
      { name: "Rate Groups", href: "/dashboard/interest-rate-groups", icon: TrendingUp, permissions: ["VIEW_SAVINGS", "MANAGE_SAVINGS"], roles: ["ADMIN", "MANAGER"] },
      { name: "Dividends", href: "/dashboard/enhanced-dividends", icon: PiggyBank, permissions: ["VIEW_SAVINGS", "MANAGE_SAVINGS"], roles: ["ADMIN", "MANAGER", "ACCOUNTANT"] },
      { name: "Loan Groups", href: "/dashboard/loan-groups", icon: UserCheck, permissions: ["VIEW_LOANS", "MANAGE_LOANS"], roles: ["ADMIN", "MANAGER", "LOAN_OFFICER"] },
      { name: "Loan Fees", href: "/dashboard/loan-fees", icon: HandCoins, permissions: ["VIEW_LOANS", "MANAGE_LOANS"], roles: ["ADMIN", "MANAGER"] },
      { name: "Schedule Preview", href: "/dashboard/schedule-preview", icon: CalendarRange, permissions: ["VIEW_LOANS", "MANAGE_LOANS"], roles: ["ADMIN", "MANAGER", "LOAN_OFFICER", "CASHIER"] },
      { name: "Cashier", href: "/dashboard/cashier", icon: Banknote, permissions: ["CASHIER_SESSION_OPEN", "CASHIER_SESSION_VIEW"], roles: ["ADMIN", "MANAGER", "CASHIER"] },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { name: "Accounting", href: "/dashboard/accounting", icon: Calculator, permissions: ["VIEW_ACCOUNTING"], roles: ["ADMIN", "MANAGER", "ACCOUNTANT"] },
      { name: "Branches", href: "/branches", icon: Building2, permissions: ["VIEW_BRANCHES", "MANAGE_BRANCHES"], roles: ["ADMIN", "MANAGER"] },
      { name: "Employers", href: "/dashboard/employers", icon: Factory, permissions: ["MANAGE_PAYROLL"], roles: ["ADMIN", "MANAGER"] },
      { name: "Payroll", href: "/dashboard/payroll", icon: Receipt, permissions: ["VIEW_PAYROLL", "MANAGE_PAYROLL"], roles: ["ADMIN", "MANAGER"] },
      { name: "Users", href: "/users", icon: UserCog, permissions: ["VIEW_USERS"], roles: ["ADMIN", "MANAGER"] },
      { name: "Roles", href: "/dashboard/roles", icon: Shield, permissions: ["MANAGE_ROLES"], roles: ["ADMIN"] },
      { name: "Currencies", href: "/dashboard/currencies", icon: Coins, permissions: ["VIEW_CURRENCIES", "MANAGE_CURRENCIES"], roles: ["ADMIN", "MANAGER", "ACCOUNTANT"] },
      { name: "FX Positions", href: "/dashboard/fx-positions", icon: DollarSign, permissions: ["VIEW_FX_POSITIONS"], roles: ["ADMIN", "MANAGER", "ACCOUNTANT"] },
      { name: "Settlements", href: "/dashboard/branch-settlements", icon: GitBranch, permissions: ["MANAGE_BRANCH_SETTLEMENTS"], roles: ["ADMIN", "MANAGER"] },
      { name: "Txn Limits", href: "/dashboard/transaction-limits", icon: ShieldCheck, permissions: ["MANAGE_TRANSACTION_LIMITS"], roles: ["ADMIN", "MANAGER"] },
      { name: "Sessions", href: "/dashboard/session-restrictions", icon: Clock, permissions: ["MANAGE_SESSION_RESTRICTIONS"], roles: ["ADMIN"] },
      { name: "Batch Import", href: "/dashboard/batch-import", icon: Upload, permissions: ["MANAGE_BATCH_IMPORTS"], roles: ["ADMIN", "MANAGER", "CASHIER"] },
      { name: "Passbook", href: "/dashboard/passbook", icon: Printer, permissions: ["VIEW_PASSBOOK"], roles: ["ADMIN", "MANAGER", "CASHIER"] },
      { name: "Fixed Assets", href: "/dashboard/fixed-assets", icon: Package, permissions: ["FIXED_ASSETS_VIEW"], roles: ["ADMIN", "MANAGER", "ACCOUNTANT"] },
      { name: "Budgets", href: "/dashboard/budgets", icon: PieChart, permissions: ["BUDGET_VIEW"], roles: ["ADMIN", "MANAGER", "ACCOUNTANT"] },
      { name: "Cost Centers", href: "/dashboard/cost-centers", icon: Target, permissions: ["COST_CENTER_VIEW"], roles: ["ADMIN", "MANAGER", "ACCOUNTANT"] },
      { name: "Joint Accounts", href: "/dashboard/joint-accounts", icon: UserPlus, permissions: [], roles: ["ADMIN", "MANAGER", "CASHIER"] },
      { name: "ALM Report", href: "/dashboard/accounting/alm-report", icon: BarChart3, permissions: ["VIEW_ACCOUNTING"], roles: ["ADMIN", "MANAGER", "ACCOUNTANT"] },
      { name: "Loan Insurance", href: "/dashboard/loan-insurance", icon: ShieldPlus, permissions: ["VIEW_LOANS", "MANAGE_LOANS"], roles: ["ADMIN", "MANAGER", "LOAN_OFFICER"] },
      { name: "Custom Fields", href: "/dashboard/custom-fields", icon: FormInput, permissions: ["VIEW_MEMBERS", "MANAGE_MEMBERS"], roles: ["ADMIN", "MANAGER"] },
      { name: "Settings", href: "/dashboard/settings", icon: Settings, permissions: ["MANAGE_SETTINGS"], roles: ["ADMIN"] },
      { name: "Change Password", href: "/dashboard/change-password", icon: Lock, permissions: [], roles: ["ADMIN", "MANAGER", "CASHIER", "LOAN_OFFICER", "ACCOUNTANT"] },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const user = session?.user as any;

  const userPermissions: string[] = user?.permissions || [];

  // Build a flat list for active-link disambiguation
  const allItems = navigation.flatMap((g) => g.items);
  const filteredGroups = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        // Items with empty permissions array are always visible (e.g., Change Password)
        if (item.permissions.length === 0) return true;
        // Permission-based filtering (primary)
        if (userPermissions.length > 0 && item.permissions.some((p) => userPermissions.includes(p))) {
          return true;
        }
        // Role-based filtering (fallback — covers new permissions not yet in token)
        return user?.role ? item.roles.includes(user.role) : false;
      }),
    }))
    .filter((g) => g.items.length > 0);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href ||
    (pathname.startsWith(href + "/") &&
      !allItems.some(
        (other) =>
          other.href !== href &&
          other.href.startsWith(href + "/") &&
          (pathname === other.href || pathname.startsWith(other.href + "/"))
      ));

  const sidebarWidth = isCollapsed ? "w-[72px]" : "w-64";

  // Sync sidebar width to CSS variable so the layout can respond
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "72px" : "256px"
    );
  }, [isCollapsed]);

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 border-b border-border shrink-0",
        isCollapsed && !mobile ? "px-3 py-5 justify-center" : "px-5 py-5"
      )}>
        <div className="flex items-center justify-center w-10 h-10 bg-card rounded-xl shadow-sm border border-border shrink-0">
          <Image src="/logo.png" width={40} height={40} alt="ISACCOS" className="w-8 h-8 object-contain" />
        </div>
        {(!isCollapsed || mobile) && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-foreground tracking-tight">ISEKE SACCOS</h1>
            <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Management System</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {filteredGroups.map((group) => (
          <div key={group.label}>
            {(!isCollapsed || mobile) && (
              <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">
                {group.label}
              </p>
            )}
            {isCollapsed && !mobile && <div className="h-px bg-border mx-2 mb-2" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={isCollapsed && !mobile ? item.name : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg transition-all duration-150 font-medium group relative",
                      isCollapsed && !mobile ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("w-[18px] h-[18px] shrink-0", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                    {(!isCollapsed || mobile) && <span className="text-[13px] truncate">{item.name}</span>}
                    {isCollapsed && !mobile && (
                      <div className="absolute left-full ml-2 px-2.5 py-1 bg-foreground text-background text-xs rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Language Switcher + Collapse toggle */}
      <div className="px-3 py-2 border-t border-border space-y-1">
        {(!isCollapsed || mobile) && (
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-xs font-medium"
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            {!isCollapsed && <span>Collapse</span>}
          </button>
        )}
      </div>

      {/* User Info & Logout */}
      <div className={cn("border-t border-border p-3 shrink-0", isCollapsed && !mobile && "px-2")}>
        <div className={cn(
          "flex items-center gap-3 mb-2 rounded-lg p-2.5",
          isCollapsed && !mobile ? "justify-center" : ""
        )}>
          <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-primary to-success text-primary-foreground rounded-full font-semibold text-xs shadow-sm shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          {(!isCollapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.role?.replace(/_/g, " ")}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={cn(
            "flex items-center gap-2 w-full rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors font-medium",
            isCollapsed && !mobile ? "justify-center px-2 py-2" : "px-3 py-2"
          )}
        >
          <LogOut className="w-4 h-4" />
          {(!isCollapsed || mobile) && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-card text-foreground border border-border rounded-xl shadow-md hover:shadow-lg transition-shadow"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r border-border transition-all duration-200 z-30",
        sidebarWidth
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent mobile />
      </aside>
    </>
  );
}
