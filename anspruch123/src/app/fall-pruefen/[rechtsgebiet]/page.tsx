import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseWizard } from "@/components/wizard";
import { legalAreas, type LegalAreaKey } from "@/data/legal-areas";

interface PageProps {
  params: Promise<{
    rechtsgebiet: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { rechtsgebiet } = await params;
  const area = legalAreas.find((a) => a.key === rechtsgebiet);

  if (!area) {
    return {
      title: "Rechtsgebiet nicht gefunden",
    };
  }

  return {
    title: `${area.name} - Fall prüfen`,
    description: `Prüfen Sie kostenlos Ihren Fall im Bereich ${area.name}. ${area.description}`,
  };
}

export function generateStaticParams() {
  return legalAreas.map((area) => ({
    rechtsgebiet: area.key,
  }));
}

export default async function RechtsgebietPage({ params }: PageProps) {
  const { rechtsgebiet } = await params;
  const area = legalAreas.find((a) => a.key === rechtsgebiet);

  if (!area) {
    notFound();
  }

  return <CaseWizard initialLegalArea={rechtsgebiet as LegalAreaKey} />;
}
