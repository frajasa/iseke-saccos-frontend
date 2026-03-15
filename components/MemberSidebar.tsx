"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Receipt,
  FileText,
  LogOut,
  Menu,
  X,
  PiggyBank,
  User,
  Calculator,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";

const navigation = [
  {
    label: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/member", icon: LayoutDashboard },
      { name: "My Profile", href: "/member/profile", icon: User },
    ],
  },
  {
    label: "ACCOUNTS",
    items: [
      { name: "Savings Accounts", href: "/member/accounts", icon: PiggyBank },
      { name: "Loan Accounts", href: "/member/loans", icon: CreditCard },
      { name: "My Deductions", href: "/member/deductions", icon: Receipt },
    ],
  },
  {
    label: "SERVICES",
    items: [
      { name: "Apply for Loan", href: "/member/apply-loan", icon: CreditCard },
      { name: "Request Withdrawal", href: "/member/withdraw", icon: Wallet },
      { name: "My Requests", href: "/member/requests", icon: FileText },
      { name: "My Guarantees", href: "/member/guarantees", icon: ShieldCheck },
      { name: "Loan Calculator", href: "/member/loan-calculator", icon: Calculator },
    ],
  },
];

export default function MemberSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const user = session?.user as any;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border shrink-0">
        <div className="flex items-center justify-center w-10 h-10 bg-card rounded-xl shadow-sm border border-border shrink-0">
          <Image src="/logo.png" width={40} height={40} alt="ISACCOS" className="w-8 h-8 object-contain" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-foreground tracking-tight">ISEKE SACCOS</h1>
          <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Member Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navigation.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground tracking-[0.08em] uppercase">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 font-medium group",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                    <span className="text-[13px] truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-border p-3 shrink-0">
        <div className="flex items-center gap-3 mb-2 rounded-lg p-2.5">
          <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-primary to-success text-primary-foreground rounded-full font-semibold text-xs shadow-sm shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate leading-tight">{user?.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">Member</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
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

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-card border-r border-border z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
