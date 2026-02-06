"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  ChevronRight,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mock conversations data
const mockConversations = [
  {
    id: "1",
    caseId: "1",
    caseTitle: "Kündigung Arbeitsverhältnis",
    caseNumber: "A123-2024-001",
    lawyerName: "Dr. Thomas Weber",
    lastMessage: "Ich werde zunächst ein Schreiben an Ihren Arbeitgeber aufsetzen und die Kündigung anfechten.",
    lastMessageAt: new Date("2024-01-19T09:00:00"),
    unreadCount: 1,
  },
  {
    id: "2",
    caseId: "2",
    caseTitle: "Mietminderung wegen Schimmel",
    caseNumber: "A123-2024-002",
    lawyerName: "Dr. Sarah Müller",
    lastMessage: "Können Sie bitte noch Fotos vom Schimmelbefall hochladen?",
    lastMessageAt: new Date("2024-01-18T14:30:00"),
    unreadCount: 0,
  },
  {
    id: "3",
    caseId: "4",
    caseTitle: "DSGVO Auskunftsersuchen",
    caseNumber: "A123-2024-004",
    lawyerName: "Dr. Thomas Weber",
    lastMessage: "Vielen Dank für Ihre Nachricht. Ich melde mich zeitnah.",
    lastMessageAt: new Date("2024-01-17T11:00:00"),
    unreadCount: 2,
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

function formatDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return new Intl.DateTimeFormat("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } else if (diffDays === 1) {
    return "Gestern";
  } else if (diffDays < 7) {
    return new Intl.DateTimeFormat("de-DE", { weekday: "short" }).format(date);
  } else {
    return new Intl.DateTimeFormat("de-DE", {
      day: "numeric",
      month: "short",
    }).format(date);
  }
}

function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(mockConversations[0]?.id || null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const currentConversation = mockConversations.find((c) => c.id === selectedConversation);

  const filteredConversations = mockConversations.filter(
    (conv) =>
      conv.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lawyerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-[var(--color-ink)]">Nachrichten</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Kommunizieren Sie mit Ihren Anwälten zu Ihren Fällen
        </p>
      </div>

      {/* Messages Container */}
      <Card className="overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversations List */}
          <div className="w-full max-w-sm border-r border-[var(--color-border)] flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-[var(--color-border)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
                <input
                  type="text"
                  placeholder="Konversationen suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-10 text-sm"
                />
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <MessageSquare className="h-12 w-12 text-[var(--color-muted)]" />
                  <p className="mt-4 text-sm text-[var(--color-muted)]">
                    Keine Konversationen gefunden
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={cn(
                      "w-full p-4 text-left border-b border-[var(--color-border)] transition-colors hover:bg-gray-50",
                      selectedConversation === conv.id && "bg-[var(--color-accent)]/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-sage)] text-white">
                        {conv.lawyerName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-[var(--color-ink)] truncate">
                            {conv.caseTitle}
                          </p>
                          <span className="text-xs text-[var(--color-muted)] shrink-0">
                            {formatDate(conv.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">
                          {conv.lawyerName}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-[var(--color-muted)] truncate pr-2">
                            {conv.lastMessage}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-xs text-white shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Thread */}
          {selectedConversation && currentConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-sage)] text-white">
                    {currentConversation.lawyerName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">
                      {currentConversation.lawyerName}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {currentConversation.caseTitle}
                    </p>
                  </div>
                </div>
                <Link href={`/dashboard/faelle/${currentConversation.caseId}`}>
                  <Button variant="outline" size="sm">
                    Zum Fall
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mockMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.sender === "client" ? "flex-row-reverse" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-sm",
                        message.sender === "client"
                          ? "bg-[var(--color-accent)]"
                          : "bg-[var(--color-sage)]"
                      )}
                    >
                      {message.senderName[0]}
                    </div>
                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg p-4",
                        message.sender === "client"
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-gray-100 text-[var(--color-ink)]"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={cn(
                          "mt-2 text-xs",
                          message.sender === "client"
                            ? "text-white/70"
                            : "text-[var(--color-muted)]"
                        )}
                      >
                        {formatFullDate(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-[var(--color-border)]">
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
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-[var(--color-muted)] mx-auto" />
                <p className="mt-4 text-[var(--color-muted)]">
                  Wählen Sie eine Konversation aus
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
