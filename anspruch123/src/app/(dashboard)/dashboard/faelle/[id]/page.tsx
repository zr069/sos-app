"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Upload,
  Download,
  Calendar,
  User,
  Send,
  Paperclip,
  Eye,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock case data
const mockCase = {
  id: "1",
  title: "Kündigung Arbeitsverhältnis",
  description: "Fristlose Kündigung nach 5 Jahren Betriebszugehörigkeit ohne Abmahnung. Der Arbeitgeber hat mir am 10.01.2024 ohne vorherige Abmahnung fristlos gekündigt. Ich war 5 Jahre im Unternehmen beschäftigt und hatte bisher keine Konflikte.",
  legalArea: "Arbeitsrecht",
  subCategory: "Kündigung erhalten",
  status: "IN_REVIEW",
  priority: "HIGH",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-20"),
  caseNumber: "A123-2024-001",
  assignedLawyer: {
    name: "Dr. Thomas Weber",
    email: "t.weber@anspruch123.de",
  },
  contactInfo: {
    name: "Max Mustermann",
    email: "max.mustermann@email.de",
    phone: "0151 12345678",
  },
  details: {
    employmentDuration: "5 Jahre",
    terminationDate: "10.01.2024",
    noticePeriod: "Fristlos",
    previousWarnings: "Keine",
    employerName: "Beispiel GmbH",
  },
};

const mockDocuments = [
  {
    id: "1",
    name: "Kündigungsschreiben.pdf",
    type: "application/pdf",
    size: "245 KB",
    uploadedAt: new Date("2024-01-15"),
    uploadedBy: "Mandant",
  },
  {
    id: "2",
    name: "Arbeitsvertrag.pdf",
    type: "application/pdf",
    size: "1.2 MB",
    uploadedAt: new Date("2024-01-15"),
    uploadedBy: "Mandant",
  },
  {
    id: "3",
    name: "Rechtliche_Einschätzung.pdf",
    type: "application/pdf",
    size: "156 KB",
    uploadedAt: new Date("2024-01-18"),
    uploadedBy: "Anwalt",
  },
];

const mockMessages = [
  {
    id: "1",
    content: "Sehr geehrter Herr Mustermann, vielen Dank für die Übermittlung Ihrer Unterlagen. Ich habe Ihren Fall geprüft und sehe gute Chancen, gegen die Kündigung vorzugehen.",
    sender: "lawyer",
    senderName: "Dr. Thomas Weber",
    createdAt: new Date("2024-01-18T10:30:00"),
  },
  {
    id: "2",
    content: "Vielen Dank für die schnelle Rückmeldung! Was sind die nächsten Schritte?",
    sender: "client",
    senderName: "Max Mustermann",
    createdAt: new Date("2024-01-18T14:15:00"),
  },
  {
    id: "3",
    content: "Ich werde zunächst ein Schreiben an Ihren Arbeitgeber aufsetzen und die Kündigung anfechten. Parallel bereite ich die Kündigungsschutzklage vor. Die Frist dafür beträgt 3 Wochen ab Zugang der Kündigung.",
    sender: "lawyer",
    senderName: "Dr. Thomas Weber",
    createdAt: new Date("2024-01-19T09:00:00"),
  },
];

const mockDeadlines = [
  {
    id: "1",
    title: "Kündigungsschutzklage einreichen",
    dueDate: new Date("2024-01-31"),
    status: "pending",
  },
  {
    id: "2",
    title: "Stellungnahme des Arbeitgebers",
    dueDate: new Date("2024-02-15"),
    status: "pending",
  },
];

const mockTimeline = [
  { date: new Date("2024-01-15"), event: "Fall eingereicht", type: "created" },
  { date: new Date("2024-01-16"), event: "Fall angenommen", type: "status" },
  { date: new Date("2024-01-18"), event: "Rechtliche Einschätzung erstellt", type: "document" },
  { date: new Date("2024-01-20"), event: "In Prüfung", type: "status" },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  NEW: { label: "Neu", color: "text-blue-700", bgColor: "bg-blue-100", icon: FileText },
  IN_REVIEW: { label: "In Prüfung", color: "text-yellow-700", bgColor: "bg-yellow-100", icon: Clock },
  AWAITING_DOCUMENTS: { label: "Dokumente ausstehend", color: "text-orange-700", bgColor: "bg-orange-100", icon: AlertCircle },
  IN_PROGRESS: { label: "In Bearbeitung", color: "text-purple-700", bgColor: "bg-purple-100", icon: TrendingUp },
  COMPLETED: { label: "Abgeschlossen", color: "text-green-700", bgColor: "bg-green-100", icon: CheckCircle2 },
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function CaseDetailPage() {
  const params = useParams();
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "messages" | "documents" | "timeline">("overview");

  const status = statusConfig[mockCase.status];
  const StatusIcon = status.icon;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    // In production: send message to API
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div>
        <Link
          href="/dashboard/faelle"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)] mb-4"
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
              <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", status.bgColor, status.color)}>
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </div>
            </div>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Fall-Nr.: {mockCase.caseNumber} • {mockCase.legalArea} • {mockCase.subCategory}
            </p>
          </div>
          <Button variant="outline">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)]">
        <nav className="flex gap-6 -mb-px">
          {[
            { id: "overview", label: "Übersicht" },
            { id: "messages", label: "Nachrichten", badge: 2 },
            { id: "documents", label: "Dokumente", badge: mockDocuments.length },
            { id: "timeline", label: "Verlauf" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              )}
            >
              {tab.label}
              {tab.badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)]/10 px-1.5 text-xs text-[var(--color-accent)]">
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
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Fallbeschreibung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--color-muted)] whitespace-pre-wrap">{mockCase.description}</p>
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
                      <dt className="text-sm text-[var(--color-muted)]">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </dt>
                      <dd className="mt-1 font-medium text-[var(--color-ink)]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            {/* Recent Documents */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Dokumente</CardTitle>
                  <CardDescription>Zuletzt hochgeladene Dateien</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                  Hochladen
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDocuments.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                          <FileText className="h-5 w-5 text-[var(--color-accent)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">{doc.name}</p>
                          <p className="text-xs text-[var(--color-muted)]">
                            {doc.size} • {doc.uploadedBy} • {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assigned Lawyer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[var(--color-accent)]" />
                  Ihr Anwalt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-sage)] text-white font-medium">
                    TW
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">{mockCase.assignedLawyer.name}</p>
                    <p className="text-sm text-[var(--color-muted)]">{mockCase.assignedLawyer.email}</p>
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={() => setActiveTab("messages")}>
                  <MessageSquare className="h-4 w-4" />
                  Nachricht senden
                </Button>
              </CardContent>
            </Card>

            {/* Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[var(--color-accent)]" />
                  Fristen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDeadlines.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="rounded-lg border border-[var(--color-border)] p-3"
                    >
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

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Ihre Kontaktdaten</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-[var(--color-muted)]">Name</dt>
                    <dd className="font-medium text-[var(--color-ink)]">{mockCase.contactInfo.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted)]">E-Mail</dt>
                    <dd className="font-medium text-[var(--color-ink)]">{mockCase.contactInfo.email}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted)]">Telefon</dt>
                    <dd className="font-medium text-[var(--color-ink)]">{mockCase.contactInfo.phone}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "messages" && (
        <Card>
          <CardContent className="p-0">
            {/* Messages List */}
            <div className="max-h-[500px] overflow-y-auto p-6 space-y-4">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.sender === "client" ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-sm",
                    message.sender === "client" ? "bg-[var(--color-accent)]" : "bg-[var(--color-sage)]"
                  )}>
                    {message.senderName[0]}
                  </div>
                  <div className={cn(
                    "max-w-[70%] rounded-lg p-4",
                    message.sender === "client"
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-gray-100 text-[var(--color-ink)]"
                  )}>
                    <p className="text-sm">{message.content}</p>
                    <p className={cn(
                      "mt-2 text-xs",
                      message.sender === "client" ? "text-white/70" : "text-[var(--color-muted)]"
                    )}>
                      {message.senderName} • {formatDate(message.createdAt)} {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t border-[var(--color-border)] p-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <Button type="button" variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nachricht schreiben..."
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
              <CardTitle>Alle Dokumente</CardTitle>
              <CardDescription>{mockDocuments.length} Dateien</CardDescription>
            </div>
            <Button>
              <Upload className="h-4 w-4" />
              Dokument hochladen
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-accent)]/10">
                      <FileText className="h-6 w-6 text-[var(--color-accent)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-ink)]">{doc.name}</p>
                      <p className="text-sm text-[var(--color-muted)]">
                        {doc.size} • Hochgeladen von {doc.uploadedBy} am {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                      Ansehen
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "timeline" && (
        <Card>
          <CardHeader>
            <CardTitle>Fall-Verlauf</CardTitle>
            <CardDescription>Chronologische Übersicht aller Aktivitäten</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--color-border)]" />
              <div className="space-y-6">
                {mockTimeline.map((item, index) => (
                  <div key={index} className="relative flex gap-4 pl-10">
                    <div className={cn(
                      "absolute left-2 h-5 w-5 rounded-full border-2 border-white",
                      item.type === "created" ? "bg-[var(--color-accent)]" :
                      item.type === "document" ? "bg-[var(--color-sage)]" : "bg-[var(--color-gold)]"
                    )} />
                    <div>
                      <p className="font-medium text-[var(--color-ink)]">{item.event}</p>
                      <p className="text-sm text-[var(--color-muted)]">{formatDate(item.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
