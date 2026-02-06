"use client";

import { HelpCircle } from "lucide-react";
import { useWizard } from "../wizard-context";
import { cn } from "@/lib/utils";
import type { WizardQuestion } from "@/data/wizard-questions";

function QuestionInput({ question }: { question: WizardQuestion }) {
  const { state, setAnswer } = useWizard();
  const value = state.answers[question.key] || "";

  const handleChange = (newValue: string | string[]) => {
    setAnswer(question.key, newValue);
  };

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    const currentValue = Array.isArray(value) ? value : [];
    if (checked) {
      handleChange([...currentValue, optionValue]);
    } else {
      handleChange(currentValue.filter((v) => v !== optionValue));
    }
  };

  // Check if question should be shown based on condition
  if (question.condition) {
    const conditionAnswer = state.answers[question.condition.questionKey];
    const conditionValues = Array.isArray(question.condition.value)
      ? question.condition.value
      : [question.condition.value];

    if (Array.isArray(conditionAnswer)) {
      if (!conditionValues.some((v) => conditionAnswer.includes(v))) {
        return null;
      }
    } else if (!conditionValues.includes(conditionAnswer as string)) {
      return null;
    }
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
      <div className="mb-4">
        <label className="flex items-start gap-2 font-medium text-[var(--color-ink)]">
          <span>{question.question}</span>
          {question.required && (
            <span className="text-[var(--color-accent)]">*</span>
          )}
        </label>
        {question.helpText && (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-[var(--color-muted)]">
            <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {question.helpText}
          </p>
        )}
      </div>

      {question.inputType === "text" && (
        <input
          type="text"
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={question.placeholder}
          className="form-input"
        />
      )}

      {question.inputType === "textarea" && (
        <textarea
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          className="form-input resize-none"
        />
      )}

      {question.inputType === "number" && (
        <input
          type="number"
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={question.placeholder}
          className="form-input"
        />
      )}

      {question.inputType === "date" && (
        <input
          type="date"
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          className="form-input"
        />
      )}

      {question.inputType === "radio" && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all",
                value === option.value
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                  : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
              )}
            >
              <input
                type="radio"
                name={question.key}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => handleChange(e.target.value)}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              <span className="text-[var(--color-ink)]">{option.label}</span>
            </label>
          ))}
        </div>
      )}

      {question.inputType === "checkbox" && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => {
            const isChecked = Array.isArray(value) && value.includes(option.value);
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all",
                  isChecked
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                    : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
                )}
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={isChecked}
                  onChange={(e) =>
                    handleCheckboxChange(option.value, e.target.checked)
                  }
                  className="h-4 w-4 rounded accent-[var(--color-accent)]"
                />
                <span className="text-[var(--color-ink)]">{option.label}</span>
              </label>
            );
          })}
        </div>
      )}

      {question.inputType === "select" && question.options && (
        <select
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          className="form-input"
        >
          <option value="">Bitte wählen...</option>
          {question.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export function QuestionsStep() {
  const { questions, legalAreaData, state } = useWizard();

  const subCategory = legalAreaData?.subCategories.find(
    (s) => s.key === state.subCategory
  );

  if (!questions.length) {
    return (
      <div className="animate-fade-in text-center">
        <p className="text-[var(--color-muted)]">
          Keine Fragen für diese Kategorie verfügbar.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="font-serif text-2xl text-[var(--color-ink)] md:text-3xl">
          Erzählen Sie uns mehr
        </h2>
        <p className="mt-2 text-[var(--color-muted)]">
          {subCategory?.name} – Beantworten Sie die folgenden Fragen, damit wir
          Ihren Fall einschätzen können.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {questions.map((question) => (
          <QuestionInput key={question.key} question={question} />
        ))}
      </div>
    </div>
  );
}
