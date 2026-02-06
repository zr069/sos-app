"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Upload,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SessionProvider } from "@/components/providers/session-provider";

const navigation = [
  { name: "Übersicht", href: "/dashboard", icon: LayoutDashboard },
  { name: "Meine Fälle", href: "/dashboard/faelle", icon: FileText },
  { name: "Nachrichten", href: "/dashboard/nachrichten", icon: MessageSquare },
  { name: "Dokumente", href: "/dashboard/dokumente", icon: Upload },
  { name: "Einstellungen", href: "/dashboard/einstellungen", icon: Settings },
];

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-[var(--color-border)]">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]">
                <span className="font-serif text-sm font-bold text-white">A</span>
              </div>
              <span className="font-serif text-xl">
                Anspruch<span className="text-[var(--color-accent)]">123</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* New Case Button */}
          <div className="p-4">
            <Link href="/fall-pruefen">
              <Button className="w-full">
                <Plus className="h-4 w-4" />
                Neuen Fall einreichen
              </Button>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                      : "text-[var(--color-muted)] hover:bg-gray-100 hover:text-[var(--color-ink)]"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-[var(--color-border)] p-4">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-sage)] text-white">
                  {session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-ink)] truncate">
                    {session?.user?.name || "Benutzer"}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] truncate">
                    {session?.user?.email}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-[var(--color-muted)]" />
              </button>

              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-[var(--color-border)] bg-white shadow-lg">
                  <Link
                    href="/dashboard/einstellungen"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-muted)] hover:bg-gray-100 hover:text-[var(--color-ink)]"
                  >
                    <Settings className="h-4 w-4" />
                    Einstellungen
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--color-error)] hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Abmelden
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-white px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 lg:flex-initial" />

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-[var(--color-muted)] hover:text-[var(--color-ink)]">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--color-accent)]" />
            </button>

            {/* User avatar (desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--color-ink)]">
                  {session?.user?.name || "Benutzer"}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-sage)] text-white">
                {session?.user?.name?.[0] || session?.user?.email?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SessionProvider>
  );
}
