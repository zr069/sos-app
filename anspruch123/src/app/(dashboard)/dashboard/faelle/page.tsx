"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data
const mockCases = [
  {
    id: "1",
    title: "Kündigung Arbeitsverhältnis",
    description: "Fristlose Kündigung nach 5 Jahren Betriebszugehörigkeit ohne Abmahnung",
    legalArea: "Arbeitsrecht",
    subCategory: "Kündigung erhalten",
    status: "IN_REVIEW",
    priority: "HIGH",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    hasUnreadMessages: true,
    documentsCount: 3,
  },
  {
    id: "2",
    title: "Mietminderung wegen Schimmel",
    description: "Schimmelbefall im Schlafzimmer seit 3 Monaten, Vermieter reagiert nicht",
    legalArea: "Mietrecht",
    subCategory: "Mängel / Mietminderung",
    status: "AWAITING_DOCUMENTS",
    priority: "MEDIUM",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    hasUnreadMessages: false,
    documentsCount: 5,
  },
  {
    id: "3",
    title: "Blitzer-Einspruch",
    description: "Geschwindigkeitsüberschreitung auf der A1, 28 km/h zu schnell",
    legalArea: "Verkehrsrecht",
    subCategory: "Bußgeldbescheid / Blitzer",
    status: "COMPLETED",
    priority: "LOW",
    createdAt: new Date("2023-12-01"),
    updatedAt: new Date("2024-01-05"),
    hasUnreadMessages: false,
    documentsCount: 2,
  },
  {
    id: "4",
    title: "DSGVO Auskunftsersuchen",
    description: "Online-Shop verweigert Auskunft über gespeicherte Daten",
    legalArea: "Datenschutz",
    subCategory: "DSGVO-Auskunft / Löschung",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-19"),
    hasUnreadMessages: true,
    documentsCount: 1,
  },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  NEW: { label: "Neu", color: "text-blue-700", bgColor: "bg-blue-100", icon: FileText },
  IN_REVIEW: { label: "In Prüfung", color: "text-yellow-700", bgColor: "bg-yellow-100", icon: Clock },
  AWAITING_DOCUMENTS: { label: "Dokumente ausstehend", color: "text-orange-700", bgColor: "bg-orange-100", icon: AlertCircle },
  IN_PROGRESS: { label: "In Bearbeitung", color: "text-purple-700", bgColor: "bg-purple-100", icon: TrendingUp },
  COMPLETED: { label: "Abgeschlossen", color: "text-green-700", bgColor: "bg-green-100", icon: CheckCircle2 },
  CLOSED: { label: "Geschlossen", color: "text-gray-700", bgColor: "bg-gray-100", icon: CheckCircle2 },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  LOW: { label: "Niedrig", color: "text-gray-500" },
  MEDIUM: { label: "Mittel", color: "text-yellow-600" },
  HIGH: { label: "Hoch", color: "text-orange-600" },
  URGENT: { label: "Dringend", color: "text-red-600" },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

type StatusFilter = "all" | "active" | "completed";

export default function CasesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredCases = mockCases.filter((caseItem) => {
    const matchesSearch =
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.legalArea.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !["COMPLETED", "CLOSED"].includes(caseItem.status)) ||
      (statusFilter === "completed" && ["COMPLETED", "CLOSED"].includes(caseItem.status));

    return matchesSearch && matchesStatus;
  });

  const activeCasesCount = mockCases.filter((c) => !["COMPLETED", "CLOSED"].includes(c.status)).length;
  const completedCasesCount = mockCases.filter((c) => ["COMPLETED", "CLOSED"].includes(c.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-[var(--color-ink)]">Meine Fälle</h1>
          <p className="mt-1 text-[var(--color-muted)]">
            Verwalten Sie Ihre eingereichten Rechtsfälle
          </p>
        </div>
        <Link href="/fall-pruefen">
          <Button>
            <Plus className="h-4 w-4" />
            Neuen Fall einreichen
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            type="text"
            placeholder="Fälle durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex rounded-lg border border-[var(--color-border)] bg-white p-1">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              statusFilter === "all"
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            )}
          >
            Alle ({mockCases.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              statusFilter === "active"
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            )}
          >
            Aktiv ({activeCasesCount})
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              statusFilter === "completed"
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            )}
          >
            Abgeschlossen ({completedCasesCount})
          </button>
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-[var(--color-muted)]" />
              <h3 className="mt-4 font-medium text-[var(--color-ink)]">Keine Fälle gefunden</h3>
              <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
                {searchQuery
                  ? "Versuchen Sie es mit anderen Suchbegriffen"
                  : "Sie haben noch keine Fälle eingereicht"}
              </p>
              {!searchQuery && (
                <Link href="/fall-pruefen" className="mt-6">
                  <Button>
                    <Plus className="h-4 w-4" />
                    Ersten Fall einreichen
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCases.map((caseItem) => {
            const status = statusConfig[caseItem.status];
            const priority = priorityConfig[caseItem.priority];
            const StatusIcon = status.icon;

            return (
              <Link key={caseItem.id} href={`/dashboard/faelle/${caseItem.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", status.bgColor)}>
                            <StatusIcon className={cn("h-5 w-5", status.color)} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-[var(--color-ink)] truncate">
                                {caseItem.title}
                              </h3>
                              {caseItem.hasUnreadMessages && (
                                <span className="flex h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
                              )}
                            </div>
                            <p className="mt-1 text-sm text-[var(--color-muted)] line-clamp-2">
                              {caseItem.description}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted)]">
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                                {caseItem.legalArea}
                              </span>
                              <span>•</span>
                              <span>{caseItem.subCategory}</span>
                              <span>•</span>
                              <span>{caseItem.documentsCount} Dokumente</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side */}
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                        <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", status.bgColor, status.color)}>
                          {status.label}
                        </div>
                        <div className="text-xs text-[var(--color-muted)]">
                          <span className={priority.color}>Priorität: {priority.label}</span>
                        </div>
                        <div className="text-xs text-[var(--color-muted)]">
                          Aktualisiert: {formatDate(caseItem.updatedAt)}
                        </div>
                        <ChevronRight className="h-5 w-5 text-[var(--color-muted)] hidden sm:block" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
