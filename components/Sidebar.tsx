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
} from "lucide-react";
import { useState, useEffect } from "react";

const navigation = [
  {
    label: "MAIN",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "CASHIER", "LOAN_OFFICER", "ACCOUNTANT"] },
      { name: "Members", href: "/members", icon: Users, roles: ["ADMIN", "MANAGER", "CASHIER", "LOAN_OFFICER"] },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { name: "Savings", href: "/savings", icon: Wallet, roles: ["ADMIN", "MANAGER", "CASHIER"] },
      { name: "Loans", href: "/loans", icon: CreditCard, roles: ["ADMIN", "MANAGER", "LOAN_OFFICER"] },
      { name: "Transactions", href: "/transactions", icon: ArrowLeftRight, roles: ["ADMIN", "MANAGER", "CASHIER", "ACCOUNTANT"] },
      { name: "Transfer", href: "/transactions/transfer", icon: ArrowRightLeft, roles: ["ADMIN", "MANAGER", "CASHIER"] },
      { name: "Payments", href: "/dashboard/payments", icon: Smartphone, roles: ["ADMIN", "MANAGER", "CASHIER"] },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { name: "Accounting", href: "/dashboard/accounting", icon: Calculator, roles: ["ADMIN", "MANAGER", "ACCOUNTANT"] },
      { name: "Branches", href: "/branches", icon: Building2, roles: ["ADMIN", "MANAGER"] },
      { name: "Employers", href: "/dashboard/employers", icon: Factory, roles: ["ADMIN", "MANAGER"] },
      { name: "Payroll", href: "/dashboard/payroll", icon: Receipt, roles: ["ADMIN", "MANAGER"] },
      { name: "Users", href: "/users", icon: UserCog, roles: ["ADMIN", "MANAGER"] },
      { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN"] },
      { name: "Change Password", href: "/dashboard/change-password", icon: Lock, roles: ["ADMIN", "MANAGER", "CASHIER", "LOAN_OFFICER", "ACCOUNTANT"] },
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

  // Build a flat list for active-link disambiguation
  const allItems = navigation.flatMap((g) => g.items);
  const filteredGroups = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        user?.role ? item.roles.includes(user.role) : false
      ),
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

      {/* Collapse toggle (desktop only) */}
      {!mobile && (
        <div className="px-3 py-2 border-t border-border">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-xs font-medium"
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      )}

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
