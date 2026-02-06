import { Metadata } from "next";
import { CaseWizard } from "@/components/wizard";

export const metadata: Metadata = {
  title: "Fall prüfen",
  description:
    "Prüfen Sie kostenlos Ihren Rechtsfall. Beantworten Sie einige Fragen und erhalten Sie eine erste Einschätzung Ihrer Erfolgsaussichten.",
};

export default function FallPruefenPage() {
  return <CaseWizard />;
}
