"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { type LegalAreaKey, type LegalArea, getLegalArea } from "@/data/legal-areas";
import { type WizardQuestion, getQuestionsForSubCategory } from "@/data/wizard-questions";

export interface WizardState {
  currentStep: number;
  legalArea: LegalAreaKey | null;
  subCategory: string | null;
  answers: Record<string, string | string[]>;
  files: File[];
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
  } | null;
}

interface WizardContextType {
  state: WizardState;
  legalAreaData: LegalArea | null;
  questions: WizardQuestion[];
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setLegalArea: (area: LegalAreaKey) => void;
  setSubCategory: (subCategory: string) => void;
  setAnswer: (questionKey: string, answer: string | string[]) => void;
  setFiles: (files: File[]) => void;
  setContactInfo: (info: WizardState["contactInfo"]) => void;
  resetWizard: () => void;
  canProceed: () => boolean;
}

const initialState: WizardState = {
  currentStep: 1,
  legalArea: null,
  subCategory: null,
  answers: {},
  files: [],
  contactInfo: null,
};

const WizardContext = createContext<WizardContextType | null>(null);

export function WizardProvider({
  children,
  initialLegalArea,
}: {
  children: ReactNode;
  initialLegalArea?: LegalAreaKey;
}) {
  const [state, setState] = useState<WizardState>(() => ({
    ...initialState,
    legalArea: initialLegalArea || null,
    currentStep: initialLegalArea ? 2 : 1,
  }));

  const legalAreaData = state.legalArea ? getLegalArea(state.legalArea) ?? null : null;
  const questions = state.legalArea && state.subCategory
    ? getQuestionsForSubCategory(state.legalArea, state.subCategory)
    : [];

  // Step 1: Legal Area, Step 2: SubCategory, Step 3: Questions, Step 4: Documents, Step 5: Contact, Step 6: Summary
  const totalSteps = 6;

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, Math.min(step, totalSteps)),
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, totalSteps),
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  }, []);

  const setLegalArea = useCallback((area: LegalAreaKey) => {
    setState((prev) => ({
      ...prev,
      legalArea: area,
      subCategory: null,
      answers: {},
    }));
  }, []);

  const setSubCategory = useCallback((subCategory: string) => {
    setState((prev) => ({
      ...prev,
      subCategory,
      answers: {},
    }));
  }, []);

  const setAnswer = useCallback(
    (questionKey: string, answer: string | string[]) => {
      setState((prev) => ({
        ...prev,
        answers: {
          ...prev.answers,
          [questionKey]: answer,
        },
      }));
    },
    []
  );

  const setFiles = useCallback((files: File[]) => {
    setState((prev) => ({
      ...prev,
      files,
    }));
  }, []);

  const setContactInfo = useCallback((info: WizardState["contactInfo"]) => {
    setState((prev) => ({
      ...prev,
      contactInfo: info,
    }));
  }, []);

  const resetWizard = useCallback(() => {
    setState(initialState);
  }, []);

  const canProceed = useCallback((): boolean => {
    switch (state.currentStep) {
      case 1:
        return state.legalArea !== null;
      case 2:
        return state.subCategory !== null;
      case 3:
        // Check if all required questions are answered
        const requiredQuestions = questions.filter((q) => q.required);
        return requiredQuestions.every((q) => {
          const answer = state.answers[q.key];
          if (Array.isArray(answer)) {
            return answer.length > 0;
          }
          return Boolean(answer && answer.trim() !== "");
        });
      case 4:
        // Documents are optional
        return true;
      case 5:
        return Boolean(
          state.contactInfo?.name &&
          state.contactInfo?.email &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.contactInfo.email)
        );
      default:
        return true;
    }
  }, [state, questions]);

  return (
    <WizardContext.Provider
      value={{
        state,
        legalAreaData,
        questions,
        totalSteps,
        goToStep,
        nextStep,
        prevStep,
        setLegalArea,
        setSubCategory,
        setAnswer,
        setFiles,
        setContactInfo,
        resetWizard,
        canProceed,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}
