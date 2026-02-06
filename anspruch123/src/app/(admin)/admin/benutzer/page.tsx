"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  MoreVertical,
  Eye,
  Mail,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock users data
const mockUsers = [
  {
    id: "1",
    name: "Max Mustermann",
    email: "max.mustermann@email.de",
    role: "USER",
    casesCount: 3,
    createdAt: new Date("2024-01-15"),
    lastLogin: new Date("2024-01-20T14:30:00"),
    status: "active",
  },
  {
    id: "2",
    name: "Anna Schmidt",
    email: "anna.schmidt@email.de",
    role: "USER",
    casesCount: 1,
    createdAt: new Date("2024-01-10"),
    lastLogin: new Date("2024-01-19T11:00:00"),
    status: "active",
  },
  {
    id: "3",
    name: "Peter Müller",
    email: "peter.mueller@email.de",
    role: "USER",
    casesCount: 2,
    createdAt: new Date("2024-01-08"),
    lastLogin: new Date("2024-01-18T09:15:00"),
    status: "active",
  },
  {
    id: "4",
    name: "Dr. Thomas Weber",
    email: "t.weber@anspruch123.de",
    role: "LAWYER",
    casesCount: 15,
    createdAt: new Date("2023-06-01"),
    lastLogin: new Date("2024-01-20T16:45:00"),
    status: "active",
  },
  {
    id: "5",
    name: "Dr. Sarah Müller",
    email: "s.mueller@anspruch123.de",
    role: "LAWYER",
    casesCount: 12,
    createdAt: new Date("2023-07-15"),
    lastLogin: new Date("2024-01-20T10:00:00"),
    status: "active",
  },
  {
    id: "6",
    name: "Admin User",
    email: "admin@anspruch123.de",
    role: "ADMIN",
    casesCount: 0,
    createdAt: new Date("2023-01-01"),
    lastLogin: new Date("2024-01-20T18:00:00"),
    status: "active",
  },
  {
    id: "7",
    name: "Lisa Weber",
    email: "lisa.weber@email.de",
    role: "USER",
    casesCount: 1,
    createdAt: new Date("2024-01-17"),
    lastLogin: new Date("2024-01-17T16:45:00"),
    status: "active",
  },
  {
    id: "8",
    name: "Thomas Klein",
    email: "t.klein@email.de",
    role: "USER",
    casesCount: 1,
    createdAt: new Date("2024-01-17"),
    lastLogin: null,
    status: "pending",
  },
];

const roleConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  USER: { label: "Mandant", color: "text-blue-700", bgColor: "bg-blue-100", icon: Users },
  LAWYER: { label: "Anwalt", color: "text-purple-700", bgColor: "bg-purple-100", icon: UserCheck },
  ADMIN: { label: "Administrator", color: "text-red-700", bgColor: "bg-red-100", icon: Shield },
};

const roleFilterOptions = [
  { value: "all", label: "Alle Rollen" },
  { value: "USER", label: "Mandanten" },
  { value: "LAWYER", label: "Anwälte" },
  { value: "ADMIN", label: "Administratoren" },
];

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date | null): string {
  if (!date) return "Nie";
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-[var(--color-ink)]">Benutzerverwaltung</h1>
        <p className="mt-1 text-gray-500">
          Verwalten Sie alle registrierten Benutzer
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-[var(--color-ink)]">{mockUsers.length}</p>
            <p className="text-sm text-gray-500">Gesamt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {mockUsers.filter((u) => u.role === "USER").length}
            </p>
            <p className="text-sm text-gray-500">Mandanten</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-purple-600">
              {mockUsers.filter((u) => u.role === "LAWYER").length}
            </p>
            <p className="text-sm text-gray-500">Anwälte</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">
              {mockUsers.filter((u) => u.status === "active").length}
            </p>
            <p className="text-sm text-gray-500">Aktiv</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Suche nach Name oder E-Mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-input min-w-[180px]"
            >
              {roleFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Benutzer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rolle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fälle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registriert
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Letzter Login
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.map((user) => {
                  const role = roleConfig[user.role];
                  const RoleIcon = role.icon;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-sage)] text-white">
                            {user.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <Link
                              href={`/admin/benutzer/${user.id}`}
                              className="font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                            >
                              {user.name}
                            </Link>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", role.bgColor, role.color)}>
                          <RoleIcon className="h-3.5 w-3.5" />
                          {role.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[var(--color-ink)]">{user.casesCount}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-500">{formatDate(user.createdAt)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-500">{formatDateTime(user.lastLogin)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                          user.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        )}>
                          {user.status === "active" ? "Aktiv" : "Ausstehend"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/benutzer/${user.id}`}>
                            <Button variant="ghost" size="sm" title="Ansehen">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" title="E-Mail senden">
                            <Mail className="h-4 w-4" />
                          </Button>
                          {user.role === "USER" && (
                            <Link href={`/admin/faelle?user=${user.id}`}>
                              <Button variant="ghost" size="sm" title="Fälle anzeigen">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
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
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)} von {filteredUsers.length} Benutzern
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

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500">Keine Benutzer gefunden</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
