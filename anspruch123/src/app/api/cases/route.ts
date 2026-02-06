import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LegalArea, CaseStatus, CasePriority } from "@prisma/client";

// Validation schema for case submission
const caseSubmissionSchema = z.object({
  legalArea: z.string().min(1, "Rechtsgebiet ist erforderlich"),
  subCategory: z.string().min(1, "Unterkategorie ist erforderlich"),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  contact: z.object({
    name: z.string().min(2, "Name ist erforderlich"),
    email: z.string().email("Gültige E-Mail erforderlich"),
    phone: z.string().optional(),
    preferredContact: z.enum(["email", "phone", "both"]),
    notes: z.string().optional(),
  }),
  documents: z.array(z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    url: z.string().optional(),
  })).optional(),
  pricingTier: z.enum(["BASIC", "STANDARD", "PREMIUM"]).optional(),
});

// Generate case number
function generateCaseNumber(): string {
  const prefix = "A123";
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${year}-${random}`;
}

// POST /api/cases - Create a new case
export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional for anonymous submission)
    const session = await getServerSession(authOptions);

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = caseSubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabedaten", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Generate case number
    const caseNumber = generateCaseNumber();

    // Map legal area string to enum
    const legalAreaMap: Record<string, LegalArea> = {
      "arbeitsrecht": LegalArea.ARBEITSRECHT,
      "mietrecht": LegalArea.MIETRECHT,
      "datenschutz": LegalArea.DATENSCHUTZ,
      "verkehrsrecht": LegalArea.VERKEHRSRECHT,
      "digitales": LegalArea.DIGITALES,
      "verbraucherrecht": LegalArea.VERBRAUCHERRECHT,
      "behoerden": LegalArea.BEHOERDEN,
      "finanzen": LegalArea.FINANZEN,
      "erbrecht": LegalArea.ERBRECHT,
      "alltag": LegalArea.ALLTAG,
    };

    const legalArea = legalAreaMap[data.legalArea.toLowerCase()] || LegalArea.ALLTAG;

    // Create case details from answers
    const detailsData = Object.entries(data.answers).map(([key, value]) => ({
      questionKey: key,
      answer: Array.isArray(value) ? value.join(", ") : value,
    }));

    // Create the case in the database
    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        legalArea,
        subCategory: data.subCategory,
        status: CaseStatus.EINGEREICHT,
        priority: CasePriority.NORMAL,
        userId: session?.user?.id || null,
        contactInfo: {
          create: {
            name: data.contact.name,
            email: data.contact.email,
            phone: data.contact.phone || null,
          },
        },
        details: {
          create: detailsData,
        },
      },
      include: {
        contactInfo: true,
        details: true,
      },
    });

    // TODO: Send confirmation email
    // await sendConfirmationEmail(data.contact.email, newCase);

    return NextResponse.json({
      success: true,
      caseId: newCase.id,
      caseNumber: newCase.caseNumber,
      message: "Fall erfolgreich eingereicht. Sie erhalten in Kürze eine Bestätigung per E-Mail.",
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// GET /api/cases - Get all cases for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    // Fetch cases from database
    const cases = await prisma.case.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        contactInfo: true,
        documents: true,
        _count: {
          select: {
            messages: true,
            documents: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ cases });

  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
