"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MessageSquare,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data - in production this would come from the database
const mockStats = {
  totalCases: 3,
  activeCases: 2,
  completedCases: 1,
  pendingActions: 2,
};

const mockCases = [
  {
    id: "1",
    title: "Kündigung Arbeitsverhältnis",
    legalArea: "Arbeitsrecht",
    status: "IN_REVIEW",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    hasUnreadMessages: true,
  },
  {
    id: "2",
    title: "Mietminderung wegen Schimmel",
    legalArea: "Mietrecht",
    status: "AWAITING_DOCUMENTS",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    hasUnreadMessages: false,
  },
  {
    id: "3",
    title: "Blitzer-Einspruch",
    legalArea: "Verkehrsrecht",
    status: "COMPLETED",
    createdAt: new Date("2023-12-01"),
    updatedAt: new Date("2024-01-05"),
    hasUnreadMessages: false,
  },
];

const mockDeadlines = [
  {
    id: "1",
    title: "Stellungnahme einreichen",
    caseTitle: "Kündigung Arbeitsverhältnis",
    dueDate: new Date("2024-01-25"),
  },
  {
    id: "2",
    title: "Fotos vom Schimmelbefall hochladen",
    caseTitle: "Mietminderung wegen Schimmel",
    dueDate: new Date("2024-01-28"),
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  NEW: { label: "Neu", color: "bg-blue-100 text-blue-700", icon: FileText },
  IN_REVIEW: { label: "In Prüfung", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  AWAITING_DOCUMENTS: { label: "Dokumente ausstehend", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
  IN_PROGRESS: { label: "In Bearbeitung", color: "bg-purple-100 text-purple-700", icon: TrendingUp },
  COMPLETED: { label: "Abgeschlossen", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  CLOSED: { label: "Geschlossen", color: "bg-gray-100 text-gray-700", icon: CheckCircle2 },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Heute";
  if (days === 1) return "Morgen";
  if (days < 7) return `In ${days} Tagen`;
  return formatDate(date);
}

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="font-serif text-3xl text-[var(--color-ink)]">
          Willkommen zurück{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}!
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Hier ist eine Übersicht Ihrer aktuellen Fälle und anstehenden Aufgaben.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                <FileText className="h-6 w-6 text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-ink)]">{mockStats.totalCases}</p>
                <p className="text-sm text-[var(--color-muted)]">Gesamt Fälle</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-gold)]/10">
                <Clock className="h-6 w-6 text-[var(--color-gold)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-ink)]">{mockStats.activeCases}</p>
                <p className="text-sm text-[var(--color-muted)]">Aktive Fälle</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-sage)]/10">
                <CheckCircle2 className="h-6 w-6 text-[var(--color-sage)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-ink)]">{mockStats.completedCases}</p>
                <p className="text-sm text-[var(--color-muted)]">Abgeschlossen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-ink)]">{mockStats.pendingActions}</p>
                <p className="text-sm text-[var(--color-muted)]">Offene Aufgaben</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Cases */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Aktuelle Fälle</CardTitle>
                <CardDescription>Ihre zuletzt aktualisierten Fälle</CardDescription>
              </div>
              <Link href="/dashboard/faelle">
                <Button variant="ghost" size="sm">
                  Alle anzeigen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCases.map((caseItem) => {
                  const status = statusConfig[caseItem.status];
                  const StatusIcon = status.icon;

                  return (
                    <Link
                      key={caseItem.id}
                      href={`/dashboard/faelle/${caseItem.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 rounded-lg border border-[var(--color-border)] p-4 transition-colors hover:bg-gray-50">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-[var(--color-ink)] truncate">
                              {caseItem.title}
                            </h3>
                            {caseItem.hasUnreadMessages && (
                              <span className="flex h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-[var(--color-muted)]">
                            {caseItem.legalArea} • Aktualisiert am {formatDate(caseItem.updatedAt)}
                          </p>
                        </div>
                        <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", status.color)}>
                          <StatusIcon className="h-3.5 w-3.5" />
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
              <CardDescription>Wichtige Termine im Blick</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="rounded-lg border border-[var(--color-border)] p-4"
                  >
                    <p className="font-medium text-[var(--color-ink)]">{deadline.title}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{deadline.caseTitle}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-600">
                        {formatRelativeDate(deadline.dueDate)}
                      </span>
                    </div>
                  </div>
                ))}

                {mockDeadlines.length === 0 && (
                  <p className="text-center text-sm text-[var(--color-muted)] py-8">
                    Keine anstehenden Fristen
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Schnellaktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/fall-pruefen" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Neuen Fall einreichen
                </Button>
              </Link>
              <Link href="/dashboard/nachrichten" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Nachricht senden
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
