"use client";

import Link from "next/link";
import {
  FileText,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Calendar,
  Euro,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data for admin dashboard
const mockStats = {
  totalCases: 47,
  activeCases: 23,
  newToday: 5,
  completedThisMonth: 12,
  totalUsers: 156,
  newUsersThisWeek: 8,
  pendingDocuments: 14,
  upcomingDeadlines: 7,
  revenue: 12450,
  unreadMessages: 12,
};

const mockRecentCases = [
  {
    id: "1",
    title: "Kündigung Arbeitsverhältnis",
    user: "Max Mustermann",
    legalArea: "Arbeitsrecht",
    status: "NEW",
    createdAt: new Date("2024-01-20T14:30:00"),
    priority: "HIGH",
  },
  {
    id: "2",
    title: "Mietminderung wegen Schimmel",
    user: "Anna Schmidt",
    legalArea: "Mietrecht",
    status: "IN_REVIEW",
    createdAt: new Date("2024-01-20T11:00:00"),
    priority: "MEDIUM",
  },
  {
    id: "3",
    title: "DSGVO Auskunftsersuchen",
    user: "Peter Müller",
    legalArea: "Datenschutz",
    status: "AWAITING_DOCUMENTS",
    createdAt: new Date("2024-01-20T09:15:00"),
    priority: "LOW",
  },
  {
    id: "4",
    title: "Blitzer-Einspruch",
    user: "Lisa Weber",
    legalArea: "Verkehrsrecht",
    status: "IN_PROGRESS",
    createdAt: new Date("2024-01-19T16:45:00"),
    priority: "MEDIUM",
  },
  {
    id: "5",
    title: "Nebenkostenabrechnung prüfen",
    user: "Thomas Klein",
    legalArea: "Mietrecht",
    status: "NEW",
    createdAt: new Date("2024-01-19T14:00:00"),
    priority: "LOW",
  },
];

const mockUpcomingDeadlines = [
  {
    id: "1",
    title: "Kündigungsschutzklage einreichen",
    caseTitle: "Kündigung Arbeitsverhältnis",
    user: "Max Mustermann",
    dueDate: new Date("2024-01-25"),
    daysLeft: 5,
  },
  {
    id: "2",
    title: "Einspruch Bußgeldbescheid",
    caseTitle: "Blitzer-Einspruch",
    user: "Lisa Weber",
    dueDate: new Date("2024-01-27"),
    daysLeft: 7,
  },
  {
    id: "3",
    title: "Stellungnahme Vermieter",
    caseTitle: "Mietminderung wegen Schimmel",
    user: "Anna Schmidt",
    dueDate: new Date("2024-01-30"),
    daysLeft: 10,
  },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  NEW: { label: "Neu", color: "text-blue-700", bgColor: "bg-blue-100" },
  IN_REVIEW: { label: "In Prüfung", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  AWAITING_DOCUMENTS: { label: "Dokumente ausstehend", color: "text-orange-700", bgColor: "bg-orange-100" },
  IN_PROGRESS: { label: "In Bearbeitung", color: "text-purple-700", bgColor: "bg-purple-100" },
  COMPLETED: { label: "Abgeschlossen", color: "text-green-700", bgColor: "bg-green-100" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: "Niedrig", color: "bg-gray-100 text-gray-700" },
  MEDIUM: { label: "Mittel", color: "bg-yellow-100 text-yellow-700" },
  HIGH: { label: "Hoch", color: "bg-red-100 text-red-700" },
  URGENT: { label: "Dringend", color: "bg-red-500 text-white" },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-[var(--color-ink)]">Dashboard</h1>
        <p className="mt-1 text-gray-500">
          Übersicht über alle Aktivitäten und Statistiken
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Aktive Fälle</p>
                <p className="text-3xl font-bold text-[var(--color-ink)]">{mockStats.activeCases}</p>
                <p className="mt-1 text-xs text-green-600">+{mockStats.newToday} heute</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                <FileText className="h-6 w-6 text-[var(--color-accent)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Benutzer</p>
                <p className="text-3xl font-bold text-[var(--color-ink)]">{mockStats.totalUsers}</p>
                <p className="mt-1 text-xs text-green-600">+{mockStats.newUsersThisWeek} diese Woche</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-sage)]/10">
                <Users className="h-6 w-6 text-[var(--color-sage)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Anstehende Fristen</p>
                <p className="text-3xl font-bold text-[var(--color-ink)]">{mockStats.upcomingDeadlines}</p>
                <p className="mt-1 text-xs text-orange-600">{mockStats.pendingDocuments} Dokumente ausstehend</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Umsatz (Monat)</p>
                <p className="text-3xl font-bold text-[var(--color-ink)]">{formatCurrency(mockStats.revenue)}</p>
                <p className="mt-1 text-xs text-green-600">+15% zum Vormonat</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-gold)]/10">
                <Euro className="h-6 w-6 text-[var(--color-gold)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/faelle?status=NEW" className="block">
          <Card className="transition-shadow hover:shadow-md cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-ink)]">Neue Fälle</p>
                <p className="text-2xl font-bold text-blue-600">{mockStats.newToday}</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/nachrichten" className="block">
          <Card className="transition-shadow hover:shadow-md cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-ink)]">Ungelesene Nachrichten</p>
                <p className="text-2xl font-bold text-purple-600">{mockStats.unreadMessages}</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/faelle?status=AWAITING_DOCUMENTS" className="block">
          <Card className="transition-shadow hover:shadow-md cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-ink)]">Warten auf Dokumente</p>
                <p className="text-2xl font-bold text-orange-600">{mockStats.pendingDocuments}</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/faelle?status=COMPLETED" className="block">
          <Card className="transition-shadow hover:shadow-md cursor-pointer">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-ink)]">Abgeschlossen (Monat)</p>
                <p className="text-2xl font-bold text-green-600">{mockStats.completedThisMonth}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Cases */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Neueste Fälle</CardTitle>
                <CardDescription>Zuletzt eingereichte Fälle</CardDescription>
              </div>
              <Link href="/admin/faelle">
                <Button variant="ghost" size="sm">
                  Alle anzeigen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentCases.map((caseItem) => {
                  const status = statusConfig[caseItem.status];
                  const priority = priorityConfig[caseItem.priority];

                  return (
                    <Link
                      key={caseItem.id}
                      href={`/admin/faelle/${caseItem.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[var(--color-ink)] truncate">
                              {caseItem.title}
                            </h3>
                            <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium", priority.color)}>
                              {priority.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {caseItem.user} • {caseItem.legalArea} • {formatDate(caseItem.createdAt)}
                          </p>
                        </div>
                        <div className={cn("rounded-full px-3 py-1 text-xs font-medium", status.bgColor, status.color)}>
                          {status.label}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[var(--color-accent)]" />
                Anstehende Fristen
              </CardTitle>
              <CardDescription>Dringende Termine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUpcomingDeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <p className="font-medium text-[var(--color-ink)]">{deadline.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{deadline.caseTitle}</p>
                    <p className="text-xs text-gray-400">{deadline.user}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Clock className={cn(
                        "h-4 w-4",
                        deadline.daysLeft <= 3 ? "text-red-500" : deadline.daysLeft <= 7 ? "text-orange-500" : "text-gray-400"
                      )} />
                      <span className={cn(
                        "text-sm font-medium",
                        deadline.daysLeft <= 3 ? "text-red-600" : deadline.daysLeft <= 7 ? "text-orange-600" : "text-gray-600"
                      )}>
                        {deadline.daysLeft === 1 ? "Morgen" : `In ${deadline.daysLeft} Tagen`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/admin/fristen" className="block mt-4">
                <Button variant="outline" className="w-full">
                  Alle Fristen anzeigen
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
