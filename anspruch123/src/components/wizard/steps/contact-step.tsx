"use client";

import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { useWizard } from "../wizard-context";

export function ContactStep() {
  const { state, setContactInfo } = useWizard();
  const [formData, setFormData] = useState({
    name: state.contactInfo?.name || "",
    email: state.contactInfo?.email || "",
    phone: state.contactInfo?.phone || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update context when form changes
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(formData.email);

    if (formData.name && formData.email && isValidEmail) {
      setContactInfo({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
      });
    } else {
      setContactInfo(null);
    }
  }, [formData, setContactInfo]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field: string) => {
    if (field === "name" && !formData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Bitte geben Sie Ihren Namen ein." }));
    }
    if (field === "email") {
      if (!formData.email.trim()) {
        setErrors((prev) => ({
          ...prev,
          email: "Bitte geben Sie Ihre E-Mail-Adresse ein.",
        }));
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setErrors((prev) => ({
          ...prev,
          email: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        }));
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="font-serif text-2xl text-[var(--color-ink)] md:text-3xl">
          Ihre Kontaktdaten
        </h2>
        <p className="mt-2 text-[var(--color-muted)]">
          Damit wir Ihnen die Ersteinschätzung zusenden können.
        </p>
      </div>

      <div className="mx-auto max-w-md space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="form-label">
            Vor- und Nachname <span className="text-[var(--color-accent)]">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            placeholder="Max Mustermann"
            className="form-input"
            autoComplete="name"
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="form-label">
            E-Mail-Adresse <span className="text-[var(--color-accent)]">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            placeholder="max@beispiel.de"
            className="form-input"
            autoComplete="email"
          />
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        {/* Phone (optional) */}
        <div>
          <label htmlFor="phone" className="form-label">
            Telefonnummer{" "}
            <span className="font-normal text-[var(--color-muted)]">
              (optional)
            </span>
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+49 123 456789"
            className="form-input"
            autoComplete="tel"
          />
        </div>

        {/* Privacy Note */}
        <div className="flex items-start gap-3 rounded-lg bg-[var(--color-paper)] p-4">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-sage)]" />
          <div className="text-sm text-[var(--color-muted)]">
            <p className="font-medium text-[var(--color-ink)]">
              Ihre Daten sind sicher
            </p>
            <p className="mt-1">
              Wir behandeln Ihre Daten streng vertraulich und verwenden sie
              ausschließlich zur Bearbeitung Ihrer Anfrage. Mehr Informationen
              in unserer{" "}
              <a
                href="/datenschutz"
                target="_blank"
                className="text-[var(--color-accent)] hover:underline"
              >
                Datenschutzerklärung
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
