"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileText, Image, File } from "lucide-react";
import { useWizard } from "../wizard-context";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type === "application/pdf") return FileText;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function DocumentsStep() {
  const { state, setFiles, legalAreaData } = useWizard();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subCategory = legalAreaData?.subCategories.find(
    (s) => s.key === state.subCategory
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFiles = (files: FileList | File[]): File[] => {
    const validFiles: File[] = [];
    setError(null);

    Array.from(files).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(
          `Dateityp nicht erlaubt: ${file.name}. Erlaubt sind PDF, JPG, PNG, DOC, DOCX.`
        );
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`Datei zu groß: ${file.name}. Maximale Größe ist 10 MB.`);
        return;
      }
      validFiles.push(file);
    });

    return validFiles;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const validFiles = validateFiles(e.dataTransfer.files);
        setFiles([...state.files, ...validFiles]);
      }
    },
    [state.files, setFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = validateFiles(e.target.files);
      setFiles([...state.files, ...validFiles]);
    }
    // Reset input
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    const newFiles = state.files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setError(null);
  };

  // Get document suggestions based on subcategory
  const getDocumentSuggestions = (): string[] => {
    const suggestions: Record<string, string[]> = {
      kuendigung: [
        "Kündigungsschreiben",
        "Arbeitsvertrag",
        "Letzte Gehaltsabrechnungen",
      ],
      abmahnung: ["Abmahnungsschreiben", "Arbeitsvertrag"],
      bussgeld: ["Bußgeldbescheid", "Foto vom Blitzer (falls vorhanden)"],
      mietminderung: ["Mietvertrag", "Fotos der Mängel", "Korrespondenz mit Vermieter"],
      "account-sperre": [
        "Screenshot der Sperrung",
        "E-Mails von der Plattform",
      ],
    };

    return suggestions[state.subCategory || ""] || [];
  };

  const suggestions = getDocumentSuggestions();

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="font-serif text-2xl text-[var(--color-ink)] md:text-3xl">
          Dokumente hochladen
        </h2>
        <p className="mt-2 text-[var(--color-muted)]">
          Optional: Laden Sie relevante Dokumente hoch, um eine präzisere
          Einschätzung zu erhalten.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Document Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-6 rounded-lg bg-[var(--color-sage)]/10 p-4">
            <p className="mb-2 text-sm font-medium text-[var(--color-sage)]">
              Hilfreiche Dokumente für &quot;{subCategory?.name}&quot;:
            </p>
            <ul className="space-y-1 text-sm text-[var(--color-muted)]">
              {suggestions.map((doc, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-sage)]" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "relative rounded-xl border-2 border-dashed p-8 text-center transition-all",
            dragActive
              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
              : "border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]/50"
          )}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileInput}
            className="sr-only"
          />
          <label
            htmlFor="file-upload"
            className="flex cursor-pointer flex-col items-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
              <Upload className="h-7 w-7 text-[var(--color-accent)]" />
            </div>
            <p className="text-[var(--color-ink)]">
              <span className="font-medium text-[var(--color-accent)]">
                Klicken zum Hochladen
              </span>{" "}
              oder Dateien hierher ziehen
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              PDF, JPG, PNG, DOC oder DOCX (max. 10 MB pro Datei)
            </p>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-3 text-sm text-[var(--color-error)]">{error}</p>
        )}

        {/* File List */}
        {state.files.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-[var(--color-ink)]">
              Hochgeladene Dateien ({state.files.length})
            </p>
            {state.files.map((file, index) => {
              const Icon = getFileIcon(file.type);
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-white p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-paper)]">
                    <Icon className="h-5 w-5 text-[var(--color-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--color-ink)]">
                      {file.name}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="rounded-full p-1 text-[var(--color-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-error)]"
                    aria-label="Datei entfernen"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Skip Note */}
        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
          Sie können Dokumente auch später in Ihrem Dashboard hochladen.
        </p>
      </div>
    </div>
  );
}
