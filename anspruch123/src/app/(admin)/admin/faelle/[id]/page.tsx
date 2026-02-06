"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  User,
  Calendar,
  Clock,
  Edit,
  Save,
  X,
  Upload,
  Download,
  Eye,
  Send,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock case data
const mockCase = {
  id: "1",
  caseNumber: "A123-2024-001",
  title: "Kündigung Arbeitsverhältnis",
  description: "Fristlose Kündigung nach 5 Jahren Betriebszugehörigkeit ohne vorherige Abmahnung. Der Arbeitgeber hat am 10.01.2024 die fristlose Kündigung ausgesprochen.",
  legalArea: "Arbeitsrecht",
  subCategory: "Kündigung erhalten",
  status: "IN_REVIEW",
  priority: "HIGH",
  createdAt: new Date("2024-01-20T14:30:00"),
  updatedAt: new Date("2024-01-20T14:30:00"),
  user: {
    id: "u1",
    name: "Max Mustermann",
    email: "max.mustermann@email.de",
    phone: "+49 151 12345678",
  },
  assignedLawyer: {
    id: "l1",
    name: "Dr. Thomas Weber",
  },
  details: {
    employmentDuration: "5 Jahre",
    terminationDate: "10.01.2024",
    noticePeriod: "Fristlos",
    previousWarnings: "Keine",
    employerName: "Beispiel GmbH",
    monthlyIncome: "3.500 €",
  },
  pricingTier: "STANDARD",
  estimatedValue: 2500,
};

const mockDocuments = [
  { id: "1", name: "Kündigungsschreiben.pdf", size: "245 KB", uploadedAt: new Date("2024-01-20"), uploadedBy: "Mandant" },
  { id: "2", name: "Arbeitsvertrag.pdf", size: "1.2 MB", uploadedAt: new Date("2024-01-20"), uploadedBy: "Mandant" },
  { id: "3", name: "Rechtliche_Einschätzung.pdf", size: "156 KB", uploadedAt: new Date("2024-01-21"), uploadedBy: "Anwalt" },
];

const mockMessages = [
  { id: "1", content: "Vielen Dank für die Übermittlung. Ich prüfe die Unterlagen.", sender: "lawyer", senderName: "Dr. Thomas Weber", createdAt: new Date("2024-01-20T15:00:00") },
  { id: "2", content: "Gibt es noch Informationen die Sie benötigen?", sender: "client", senderName: "Max Mustermann", createdAt: new Date("2024-01-20T16:30:00") },
];

const mockDeadlines = [
  { id: "1", title: "Kündigungsschutzklage einreichen", dueDate: new Date("2024-01-31"), status: "pending" },
  { id: "2", title: "Stellungnahme Arbeitgeber", dueDate: new Date("2024-02-15"), status: "pending" },
];

const mockNotes = [
  { id: "1", content: "Gute Erfolgsaussichten. Keine Abmahnung vor Kündigung.", createdAt: new Date("2024-01-21T10:00:00"), author: "Dr. Thomas Weber" },
];

const statusOptions = [
  { value: "NEW", label: "Neu" },
  { value: "IN_REVIEW", label: "In Prüfung" },
  { value: "AWAITING_DOCUMENTS", label: "Dokumente ausstehend" },
  { value: "IN_PROGRESS", label: "In Bearbeitung" },
  { value: "COMPLETED", label: "Abgeschlossen" },
  { value: "CLOSED", label: "Geschlossen" },
];

const priorityOptions = [
  { value: "LOW", label: "Niedrig" },
  { value: "MEDIUM", label: "Mittel" },
  { value: "HIGH", label: "Hoch" },
  { value: "URGENT", label: "Dringend" },
];

const lawyerOptions = [
  { value: "l1", label: "Dr. Thomas Weber" },
  { value: "l2", label: "Dr. Sarah Müller" },
  { value: "l3", label: "Dr. Michael Schmidt" },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  NEW: { label: "Neu", color: "text-blue-700", bgColor: "bg-blue-100" },
  IN_REVIEW: { label: "In Prüfung", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  AWAITING_DOCUMENTS: { label: "Dokumente ausstehend", color: "text-orange-700", bgColor: "bg-orange-100" },
  IN_PROGRESS: { label: "In Bearbeitung", color: "text-purple-700", bgColor: "bg-purple-100" },
  COMPLETED: { label: "Abgeschlossen", color: "text-green-700", bgColor: "bg-green-100" },
  CLOSED: { label: "Geschlossen", color: "text-gray-700", bgColor: "bg-gray-100" },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AdminCaseDetailPage() {
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCase, setEditedCase] = useState({
    status: mockCase.status,
    priority: mockCase.priority,
    assignedLawyer: mockCase.assignedLawyer?.id || "",
  });
  const [newMessage, setNewMessage] = useState("");
  const [newNote, setNewNote] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "messages" | "documents" | "notes">("overview");

  const status = statusConfig[mockCase.status];

  const handleSaveChanges = () => {
    // In production: save to API
    console.log("Saving changes:", editedCase);
    setIsEditing(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    console.log("Adding note:", newNote);
    setNewNote("");
  };

  return (
    <div className="space-y-6">
      {/* Back & Header */}
      <div>
        <Link
          href="/admin/faelle"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--color-ink)] mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Übersicht
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl text-[var(--color-ink)]">
                {mockCase.title}
              </h1>
              <span className={cn("rounded-full px-3 py-1 text-xs font-medium", status.bgColor, status.color)}>
                {status.label}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {mockCase.caseNumber} • {mockCase.legalArea} • {mockCase.subCategory}
            </p>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                  Abbrechen
                </Button>
                <Button onClick={handleSaveChanges}>
                  <Save className="h-4 w-4" />
                  Speichern
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
                Bearbeiten
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6 -mb-px">
          {[
            { id: "overview", label: "Übersicht" },
            { id: "messages", label: "Nachrichten", badge: mockMessages.length },
            { id: "documents", label: "Dokumente", badge: mockDocuments.length },
            { id: "notes", label: "Notizen", badge: mockNotes.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-gray-500 hover:text-[var(--color-ink)]"
              )}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-100 px-1.5 text-xs">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Management (Editable) */}
            <Card>
              <CardHeader>
                <CardTitle>Fallverwaltung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-sm text-gray-500">Status</label>
                    {isEditing ? (
                      <select
                        value={editedCase.status}
                        onChange={(e) => setEditedCase({ ...editedCase, status: e.target.value })}
                        className="form-input mt-1"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="mt-1 font-medium text-[var(--color-ink)]">{status.label}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Priorität</label>
                    {isEditing ? (
                      <select
                        value={editedCase.priority}
                        onChange={(e) => setEditedCase({ ...editedCase, priority: e.target.value })}
                        className="form-input mt-1"
                      >
                        {priorityOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="mt-1 font-medium text-[var(--color-ink)]">{mockCase.priority}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Zuständiger Anwalt</label>
                    {isEditing ? (
                      <select
                        value={editedCase.assignedLawyer}
                        onChange={(e) => setEditedCase({ ...editedCase, assignedLawyer: e.target.value })}
                        className="form-input mt-1"
                      >
                        <option value="">Nicht zugewiesen</option>
                        {lawyerOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="mt-1 font-medium text-[var(--color-ink)]">
                        {mockCase.assignedLawyer?.name || "Nicht zugewiesen"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Fallbeschreibung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-wrap">{mockCase.description}</p>
              </CardContent>
            </Card>

            {/* Case Details */}
            <Card>
              <CardHeader>
                <CardTitle>Fall-Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                  {Object.entries(mockCase.details).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm text-gray-500">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </dt>
                      <dd className="mt-1 font-medium text-[var(--color-ink)]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[var(--color-accent)]" />
                  Mandant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">{mockCase.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">E-Mail</p>
                    <a href={`mailto:${mockCase.user.email}`} className="text-[var(--color-accent)] hover:underline">
                      {mockCase.user.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <a href={`tel:${mockCase.user.phone}`} className="text-[var(--color-accent)] hover:underline">
                      {mockCase.user.phone}
                    </a>
                  </div>
                </div>
                <Link href={`/admin/benutzer/${mockCase.user.id}`} className="block mt-4">
                  <Button variant="outline" className="w-full">
                    Profil anzeigen
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Deadlines */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[var(--color-accent)]" />
                  Fristen
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDeadlines.map((deadline) => (
                    <div key={deadline.id} className="rounded-lg border border-gray-200 p-3">
                      <p className="font-medium text-[var(--color-ink)]">{deadline.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-orange-600">{formatDate(deadline.dueDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Abrechnung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tarif</span>
                    <span className="font-medium">{mockCase.pricingTier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Geschätzter Wert</span>
                    <span className="font-medium">{mockCase.estimatedValue.toLocaleString("de-DE")} €</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Erstellt</span>
                    <span>{formatDateTime(mockCase.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Aktualisiert</span>
                    <span>{formatDateTime(mockCase.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "messages" && (
        <Card>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto p-6 space-y-4">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-3", message.sender === "lawyer" ? "" : "flex-row-reverse")}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-sm",
                    message.sender === "lawyer" ? "bg-[var(--color-sage)]" : "bg-[var(--color-accent)]"
                  )}>
                    {message.senderName[0]}
                  </div>
                  <div className={cn(
                    "max-w-[70%] rounded-lg p-4",
                    message.sender === "lawyer" ? "bg-gray-100" : "bg-[var(--color-accent)] text-white"
                  )}>
                    <p className="text-sm">{message.content}</p>
                    <p className={cn("mt-2 text-xs", message.sender === "lawyer" ? "text-gray-500" : "text-white/70")}>
                      {message.senderName} • {formatDateTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nachricht an Mandanten..."
                  className="form-input flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                  Senden
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "documents" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Dokumente</CardTitle>
              <CardDescription>{mockDocuments.length} Dateien</CardDescription>
            </div>
            <Button>
              <Upload className="h-4 w-4" />
              Hochladen
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-[var(--color-accent)]" />
                    <div>
                      <p className="font-medium text-[var(--color-ink)]">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        {doc.size} • {doc.uploadedBy} • {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "notes" && (
        <Card>
          <CardHeader>
            <CardTitle>Interne Notizen</CardTitle>
            <CardDescription>Nur für Mitarbeiter sichtbar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddNote} className="mb-6">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Neue Notiz hinzufügen..."
                rows={3}
                className="form-input"
              />
              <div className="mt-2 flex justify-end">
                <Button type="submit" disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4" />
                  Notiz hinzufügen
                </Button>
              </div>
            </form>

            <div className="space-y-4">
              {mockNotes.map((note) => (
                <div key={note.id} className="rounded-lg border border-gray-200 p-4">
                  <p className="text-[var(--color-ink)]">{note.content}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    {note.author} • {formatDateTime(note.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
