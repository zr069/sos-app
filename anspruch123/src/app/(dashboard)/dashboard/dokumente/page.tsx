"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Upload,
  Download,
  Eye,
  Filter,
  FolderOpen,
  File,
  Image,
  FileSpreadsheet,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock documents data
const mockDocuments = [
  {
    id: "1",
    name: "Kündigungsschreiben.pdf",
    type: "application/pdf",
    size: "245 KB",
    caseId: "1",
    caseTitle: "Kündigung Arbeitsverhältnis",
    uploadedAt: new Date("2024-01-15"),
    uploadedBy: "Sie",
    category: "Korrespondenz",
  },
  {
    id: "2",
    name: "Arbeitsvertrag.pdf",
    type: "application/pdf",
    size: "1.2 MB",
    caseId: "1",
    caseTitle: "Kündigung Arbeitsverhältnis",
    uploadedAt: new Date("2024-01-15"),
    uploadedBy: "Sie",
    category: "Verträge",
  },
  {
    id: "3",
    name: "Rechtliche_Einschätzung.pdf",
    type: "application/pdf",
    size: "156 KB",
    caseId: "1",
    caseTitle: "Kündigung Arbeitsverhältnis",
    uploadedAt: new Date("2024-01-18"),
    uploadedBy: "Anwalt",
    category: "Rechtsdokumente",
  },
  {
    id: "4",
    name: "Schimmelfotos.zip",
    type: "application/zip",
    size: "8.5 MB",
    caseId: "2",
    caseTitle: "Mietminderung wegen Schimmel",
    uploadedAt: new Date("2024-01-12"),
    uploadedBy: "Sie",
    category: "Beweise",
  },
  {
    id: "5",
    name: "Mietvertrag.pdf",
    type: "application/pdf",
    size: "2.1 MB",
    caseId: "2",
    caseTitle: "Mietminderung wegen Schimmel",
    uploadedAt: new Date("2024-01-10"),
    uploadedBy: "Sie",
    category: "Verträge",
  },
  {
    id: "6",
    name: "Bußgeldbescheid.pdf",
    type: "application/pdf",
    size: "312 KB",
    caseId: "3",
    caseTitle: "Blitzer-Einspruch",
    uploadedAt: new Date("2023-12-01"),
    uploadedBy: "Sie",
    category: "Bescheide",
  },
  {
    id: "7",
    name: "Einspruch_Entwurf.docx",
    type: "application/docx",
    size: "45 KB",
    caseId: "3",
    caseTitle: "Blitzer-Einspruch",
    uploadedAt: new Date("2023-12-05"),
    uploadedBy: "Anwalt",
    category: "Rechtsdokumente",
  },
];

const categories = ["Alle", "Korrespondenz", "Verträge", "Rechtsdokumente", "Beweise", "Bescheide"];

function getFileIcon(type: string) {
  if (type.includes("pdf")) return FileText;
  if (type.includes("image") || type.includes("zip")) return Image;
  if (type.includes("spreadsheet") || type.includes("excel")) return FileSpreadsheet;
  return File;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.caseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Alle" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group documents by case
  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.caseId]) {
      acc[doc.caseId] = {
        caseTitle: doc.caseTitle,
        documents: [],
      };
    }
    acc[doc.caseId].documents.push(doc);
    return acc;
  }, {} as Record<string, { caseTitle: string; documents: typeof mockDocuments }>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-[var(--color-ink)]">Dokumente</h1>
          <p className="mt-1 text-[var(--color-muted)]">
            Alle Dokumente zu Ihren Fällen an einem Ort
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4" />
          Dokument hochladen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                <FileText className="h-6 w-6 text-[var(--color-accent)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-ink)]">{mockDocuments.length}</p>
                <p className="text-sm text-[var(--color-muted)]">Dokumente gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-sage)]/10">
                <FolderOpen className="h-6 w-6 text-[var(--color-sage)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-ink)]">{Object.keys(groupedDocuments).length}</p>
                <p className="text-sm text-[var(--color-muted)]">Aktive Fälle</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-gold)]/10">
                <Upload className="h-6 w-6 text-[var(--color-gold)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-ink)]">
                  {mockDocuments.filter((d) => d.uploadedBy === "Sie").length}
                </p>
                <p className="text-sm text-[var(--color-muted)]">Von Ihnen hochgeladen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            type="text"
            placeholder="Dokumente durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                selectedCategory === category
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-gray-100 text-[var(--color-muted)] hover:bg-gray-200"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-[var(--color-muted)]" />
            <h3 className="mt-4 font-medium text-[var(--color-ink)]">Keine Dokumente gefunden</h3>
            <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
              {searchQuery
                ? "Versuchen Sie es mit anderen Suchbegriffen"
                : "Laden Sie Ihr erstes Dokument hoch"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([caseId, { caseTitle, documents }]) => (
            <Card key={caseId}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{caseTitle}</CardTitle>
                    <CardDescription>{documents.length} Dokumente</CardDescription>
                  </div>
                  <Link href={`/dashboard/faelle/${caseId}`}>
                    <Button variant="ghost" size="sm">
                      Zum Fall
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documents.map((doc) => {
                    const FileIcon = getFileIcon(doc.type);
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                            <FileIcon className="h-5 w-5 text-[var(--color-accent)]" />
                          </div>
                          <div>
                            <p className="font-medium text-[var(--color-ink)]">{doc.name}</p>
                            <p className="text-xs text-[var(--color-muted)]">
                              {doc.size} • {doc.category} • {doc.uploadedBy} • {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" title="Ansehen">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Herunterladen">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Mehr Optionen">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
