"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  MoreVertical,
  Eye,
  MessageSquare,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock data for cases
const mockCases = [
  {
    id: "1",
    caseNumber: "A123-2024-001",
    title: "Kündigung Arbeitsverhältnis",
    user: { name: "Max Mustermann", email: "max@email.de" },
    legalArea: "Arbeitsrecht",
    subCategory: "Kündigung erhalten",
    status: "NEW",
    priority: "HIGH",
    assignedLawyer: null,
    createdAt: new Date("2024-01-20T14:30:00"),
    updatedAt: new Date("2024-01-20T14:30:00"),
    documentsCount: 2,
    messagesCount: 0,
  },
  {
    id: "2",
    caseNumber: "A123-2024-002",
    title: "Mietminderung wegen Schimmel",
    user: { name: "Anna Schmidt", email: "anna.schmidt@email.de" },
    legalArea: "Mietrecht",
    subCategory: "Mängel / Mietminderung",
    status: "IN_REVIEW",
    priority: "MEDIUM",
    assignedLawyer: { name: "Dr. Thomas Weber" },
    createdAt: new Date("2024-01-19T11:00:00"),
    updatedAt: new Date("2024-01-20T09:15:00"),
    documentsCount: 5,
    messagesCount: 3,
  },
  {
    id: "3",
    caseNumber: "A123-2024-003",
    title: "DSGVO Auskunftsersuchen",
    user: { name: "Peter Müller", email: "peter.mueller@email.de" },
    legalArea: "Datenschutz",
    subCategory: "DSGVO-Auskunft / Löschung",
    status: "AWAITING_DOCUMENTS",
    priority: "LOW",
    assignedLawyer: { name: "Dr. Sarah Müller" },
    createdAt: new Date("2024-01-18T09:15:00"),
    updatedAt: new Date("2024-01-19T16:00:00"),
    documentsCount: 1,
    messagesCount: 2,
  },
  {
    id: "4",
    caseNumber: "A123-2024-004",
    title: "Blitzer-Einspruch A1",
    user: { name: "Lisa Weber", email: "lisa.weber@email.de" },
    legalArea: "Verkehrsrecht",
    subCategory: "Bußgeldbescheid / Blitzer",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    assignedLawyer: { name: "Dr. Thomas Weber" },
    createdAt: new Date("2024-01-17T16:45:00"),
    updatedAt: new Date("2024-01-20T11:30:00"),
    documentsCount: 3,
    messagesCount: 5,
  },
  {
    id: "5",
    caseNumber: "A123-2024-005",
    title: "Nebenkostenabrechnung prüfen",
    user: { name: "Thomas Klein", email: "t.klein@email.de" },
    legalArea: "Mietrecht",
    subCategory: "Nebenkostenabrechnung",
    status: "NEW",
    priority: "LOW",
    assignedLawyer: null,
    createdAt: new Date("2024-01-17T14:00:00"),
    updatedAt: new Date("2024-01-17T14:00:00"),
    documentsCount: 1,
    messagesCount: 0,
  },
  {
    id: "6",
    caseNumber: "A123-2024-006",
    title: "Flugverspätung Entschädigung",
    user: { name: "Maria Hoffmann", email: "m.hoffmann@email.de" },
    legalArea: "Verbraucherrecht",
    subCategory: "Fluggastrechte",
    status: "COMPLETED",
    priority: "LOW",
    assignedLawyer: { name: "Dr. Sarah Müller" },
    createdAt: new Date("2024-01-10T10:00:00"),
    updatedAt: new Date("2024-01-18T15:00:00"),
    documentsCount: 4,
    messagesCount: 8,
  },
];

const statusOptions = [
  { value: "all", label: "Alle Status" },
  { value: "NEW", label: "Neu" },
  { value: "IN_REVIEW", label: "In Prüfung" },
  { value: "AWAITING_DOCUMENTS", label: "Dokumente ausstehend" },
  { value: "IN_PROGRESS", label: "In Bearbeitung" },
  { value: "COMPLETED", label: "Abgeschlossen" },
  { value: "CLOSED", label: "Geschlossen" },
];

const legalAreaOptions = [
  { value: "all", label: "Alle Rechtsgebiete" },
  { value: "Arbeitsrecht", label: "Arbeitsrecht" },
  { value: "Mietrecht", label: "Mietrecht" },
  { value: "Datenschutz", label: "Datenschutz" },
  { value: "Verkehrsrecht", label: "Verkehrsrecht" },
  { value: "Verbraucherrecht", label: "Verbraucherrecht" },
  { value: "Digitales", label: "Digitales" },
  { value: "Behörden", label: "Behörden" },
  { value: "Finanzen", label: "Finanzen" },
  { value: "Erbrecht", label: "Erbrecht" },
  { value: "Alltag", label: "Alltag" },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  NEW: { label: "Neu", color: "text-blue-700", bgColor: "bg-blue-100" },
  IN_REVIEW: { label: "In Prüfung", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  AWAITING_DOCUMENTS: { label: "Warten auf Dok.", color: "text-orange-700", bgColor: "bg-orange-100" },
  IN_PROGRESS: { label: "In Bearbeitung", color: "text-purple-700", bgColor: "bg-purple-100" },
  COMPLETED: { label: "Abgeschlossen", color: "text-green-700", bgColor: "bg-green-100" },
  CLOSED: { label: "Geschlossen", color: "text-gray-700", bgColor: "bg-gray-100" },
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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AdminCasesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [legalAreaFilter, setLegalAreaFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCases = mockCases.filter((caseItem) => {
    const matchesSearch =
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    const matchesLegalArea = legalAreaFilter === "all" || caseItem.legalArea === legalAreaFilter;

    return matchesSearch && matchesStatus && matchesLegalArea;
  });

  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-[var(--color-ink)]">Fallverwaltung</h1>
        <p className="mt-1 text-gray-500">
          Verwalten Sie alle eingereichten Rechtsfälle
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Suche nach Fall, Nummer, Name oder E-Mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input min-w-[180px]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Legal Area Filter */}
            <select
              value={legalAreaFilter}
              onChange={(e) => setLegalAreaFilter(e.target.value)}
              className="form-input min-w-[180px]"
            >
              {legalAreaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Gesamt", value: mockCases.length, color: "text-gray-700" },
          { label: "Neu", value: mockCases.filter((c) => c.status === "NEW").length, color: "text-blue-600" },
          { label: "In Bearbeitung", value: mockCases.filter((c) => ["IN_REVIEW", "IN_PROGRESS", "AWAITING_DOCUMENTS"].includes(c.status)).length, color: "text-purple-600" },
          { label: "Abgeschlossen", value: mockCases.filter((c) => c.status === "COMPLETED").length, color: "text-green-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6 text-center">
              <p className={cn("text-3xl font-bold", stat.color)}>{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cases Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fall
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mandant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rechtsgebiet
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zuständig
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellt
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedCases.map((caseItem) => {
                  const status = statusConfig[caseItem.status];
                  const priority = priorityConfig[caseItem.priority];

                  return (
                    <tr key={caseItem.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/faelle/${caseItem.id}`}
                              className="font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                            >
                              {caseItem.title}
                            </Link>
                            <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium", priority.color)}>
                              {priority.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{caseItem.caseNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-[var(--color-ink)]">{caseItem.user.name}</p>
                          <p className="text-xs text-gray-500">{caseItem.user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-[var(--color-ink)]">{caseItem.legalArea}</p>
                          <p className="text-xs text-gray-500">{caseItem.subCategory}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", status.bgColor, status.color)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {caseItem.assignedLawyer ? (
                          <p className="text-sm text-[var(--color-ink)]">{caseItem.assignedLawyer.name}</p>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Nicht zugewiesen</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-500">{formatDate(caseItem.createdAt)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/faelle/${caseItem.id}`}>
                            <Button variant="ghost" size="sm" title="Ansehen">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" title="Nachricht">
                            <MessageSquare className="h-4 w-4" />
                            {caseItem.messagesCount > 0 && (
                              <span className="ml-1 text-xs">{caseItem.messagesCount}</span>
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" title="Dokumente">
                            <FileText className="h-4 w-4" />
                            <span className="ml-1 text-xs">{caseItem.documentsCount}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
              <p className="text-sm text-gray-500">
                Zeige {(currentPage - 1) * itemsPerPage + 1} bis{" "}
                {Math.min(currentPage * itemsPerPage, filteredCases.length)} von {filteredCases.length} Fällen
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {filteredCases.length === 0 && (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500">Keine Fälle gefunden</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
