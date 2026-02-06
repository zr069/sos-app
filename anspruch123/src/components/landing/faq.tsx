"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Ist die Erstprüfung wirklich kostenlos?",
    answer:
      "Ja, die Erstprüfung ist komplett kostenlos und unverbindlich. Sie können Ihren Fall beschreiben und erhalten eine erste Einschätzung – ohne dass Kosten entstehen. Erst wenn Sie sich für die aktive Durchsetzung entscheiden, fallen Kosten an.",
  },
  {
    question: "Wer bearbeitet meinen Fall?",
    answer:
      "Anspruch123 ist eine Online-Kanzlei. Ihre Fälle werden durch unsere Anwälte oder spezialisierte Partneranwälte aus unserem Netzwerk bearbeitet. Alle sind zugelassene Rechtsanwälte mit Erfahrung in den jeweiligen Rechtsgebieten.",
  },
  {
    question: "Wie erhalte ich eine Ersteinschätzung?",
    answer:
      "Nach Abschluss des Fragebogens erhalten Sie eine erste Einschätzung Ihres Falls. Bei komplexeren Fällen kann eine individuelle Prüfung durch unsere Anwälte erforderlich sein – dann melden wir uns bei Ihnen.",
  },
  {
    question: "Welche Dokumente muss ich hochladen?",
    answer:
      "Das hängt von Ihrem Fall ab. Typische Dokumente sind z.B. Kündigungsschreiben, Bußgeldbescheide, Mietverträge oder Rechnungen. Der Wizard zeigt Ihnen genau, welche Dokumente für Ihren Fall relevant sind. Der Upload ist optional, hilft aber bei der Einschätzung.",
  },
  {
    question: "Was passiert mit meinen Daten?",
    answer:
      "Ihre Daten werden streng vertraulich behandelt und ausschließlich zur Bearbeitung Ihres Falls verwendet. Wir sind DSGVO-konform, alle Daten werden verschlüsselt übertragen und in deutschen Rechenzentren gespeichert. Sie können Ihre Daten jederzeit löschen lassen.",
  },
  {
    question: "Muss ich mich registrieren?",
    answer:
      "Für die kostenlose Erstprüfung ist keine Registrierung erforderlich. Wenn Sie Ihren Fall durchsetzen möchten, erstellen wir ein Konto für Sie, damit Sie den Fortschritt verfolgen, Dokumente einsehen und mit uns kommunizieren können.",
  },
  {
    question: "Wie werden die Kosten berechnet?",
    answer:
      "Unsere Ersteinschätzung ist kostenlos. Bei außergerichtlicher Durchsetzung arbeiten wir mit transparenten Festpreisen. Für gerichtliche Verfahren gilt das Rechtsanwaltsvergütungsgesetz (RVG). Sie erhalten immer vorab ein klares Angebot.",
  },
  {
    question: "Kann ich den Fall auch selbst bearbeiten?",
    answer:
      "Ja, nach der Ersteinschätzung erhalten Sie alle Informationen, die Sie brauchen, um den Fall selbst zu bearbeiten. Wir geben Ihnen Tipps und Musterschreiben an die Hand. Die aktive Durchsetzung durch uns ist immer optional.",
  },
];

function FaqItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border-b border-[var(--color-border)]">
      <button
        type="button"
        className="flex w-full items-center justify-between py-6 text-left"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span className="font-serif text-lg text-[var(--color-ink)]">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-[var(--color-muted)] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200",
          isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-[var(--color-muted)]">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll(".reveal");
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="faq" ref={sectionRef} className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="reveal text-center">
          <h2 className="font-serif text-3xl text-[var(--color-ink)] md:text-4xl lg:text-5xl">
            Häufige Fragen
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
            Finden Sie Antworten auf die häufigsten Fragen zu Anspruch123.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="reveal mt-12">
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="reveal mt-12 rounded-2xl bg-[var(--color-ink)] p-8 text-center text-white">
          <h3 className="font-serif text-2xl">Noch Fragen?</h3>
          <p className="mt-2 text-white/80">
            Unser Team hilft Ihnen gerne weiter.
          </p>
          <a
            href="mailto:kontakt@anspruch123.de"
            className="mt-4 inline-flex items-center text-[var(--color-gold)] hover:underline"
          >
            kontakt@anspruch123.de
          </a>
        </div>
      </div>
    </section>
  );
}
