"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  Key,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security">("profile");

  // Form states
  const [profile, setProfile] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
  });

  const [notifications, setNotifications] = useState({
    emailCaseUpdates: true,
    emailMessages: true,
    emailDeadlines: true,
    emailNewsletter: false,
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "notifications", label: "Benachrichtigungen", icon: Bell },
    { id: "security", label: "Sicherheit", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-[var(--color-ink)]">Einstellungen</h1>
        <p className="mt-1 text-[var(--color-muted)]">
          Verwalten Sie Ihr Konto und Ihre Präferenzen
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Tabs Navigation */}
        <div className="lg:w-64">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                        : "text-[var(--color-muted)] hover:bg-gray-100 hover:text-[var(--color-ink)]"
                    )}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>Persönliche Daten</CardTitle>
                <CardDescription>
                  Aktualisieren Sie Ihre persönlichen Informationen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Name & Email */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="form-label">
                        Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
                        <input
                          id="name"
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="form-input pl-10"
                          placeholder="Max Mustermann"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="form-label">
                        E-Mail
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
                        <input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="form-input pl-10"
                          placeholder="max@beispiel.de"
                          disabled
                        />
                      </div>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        Die E-Mail-Adresse kann nicht geändert werden
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="form-label">
                      Telefon
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
                      <input
                        id="phone"
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="form-input pl-10"
                        placeholder="+49 151 12345678"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="form-label">Adresse</label>
                    <div className="space-y-3">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
                        <input
                          type="text"
                          value={profile.street}
                          onChange={(e) => setProfile({ ...profile, street: e.target.value })}
                          className="form-input pl-10"
                          placeholder="Straße und Hausnummer"
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={profile.postalCode}
                          onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                          className="form-input"
                          placeholder="PLZ"
                        />
                        <input
                          type="text"
                          value={profile.city}
                          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                          className="form-input"
                          placeholder="Stadt"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Speichern...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Änderungen speichern
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>E-Mail-Benachrichtigungen</CardTitle>
                <CardDescription>
                  Wählen Sie, worüber Sie per E-Mail informiert werden möchten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {[
                      {
                        id: "emailCaseUpdates",
                        label: "Fall-Aktualisierungen",
                        description: "Benachrichtigungen über Statusänderungen Ihrer Fälle",
                      },
                      {
                        id: "emailMessages",
                        label: "Neue Nachrichten",
                        description: "Benachrichtigungen wenn Ihr Anwalt eine Nachricht sendet",
                      },
                      {
                        id: "emailDeadlines",
                        label: "Fristen-Erinnerungen",
                        description: "Erinnerungen an bevorstehende Fristen und Termine",
                      },
                      {
                        id: "emailNewsletter",
                        label: "Newsletter",
                        description: "Rechtliche Tipps und Neuigkeiten von Anspruch123",
                      },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start gap-4 rounded-lg border border-[var(--color-border)] p-4 cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={notifications[item.id as keyof typeof notifications]}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              [item.id]: e.target.checked,
                            })
                          }
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                        />
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">{item.label}</p>
                          <p className="text-sm text-[var(--color-muted)]">{item.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Speichern...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Einstellungen speichern
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Password Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-[var(--color-accent)]" />
                    Anmeldung
                  </CardTitle>
                  <CardDescription>
                    Verwalten Sie Ihre Anmeldemethoden
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-sage)]/10">
                          <Mail className="h-5 w-5 text-[var(--color-sage)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">E-Mail Login (Magic Link)</p>
                          <p className="text-sm text-[var(--color-muted)]">{session?.user?.email}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Aktiv
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                          <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">Google</p>
                          <p className="text-sm text-[var(--color-muted)]">Anmelden mit Google</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Verknüpfen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-[var(--color-error)]/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[var(--color-error)]">
                    <Trash2 className="h-5 w-5" />
                    Gefahrenzone
                  </CardTitle>
                  <CardDescription>
                    Irreversible Aktionen für Ihr Konto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 p-4">
                    <div>
                      <p className="font-medium text-[var(--color-ink)]">Konto löschen</p>
                      <p className="text-sm text-[var(--color-muted)]">
                        Ihr Konto und alle zugehörigen Daten werden permanent gelöscht
                      </p>
                    </div>
                    <Button variant="outline" className="border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)]/10">
                      <Trash2 className="h-4 w-4" />
                      Konto löschen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
