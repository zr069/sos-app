import { PrismaClient, UserRole, LegalArea, CaseStatus, CasePriority } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@anspruch123.de" },
    update: {},
    create: {
      email: "admin@anspruch123.de",
      name: "Administrator",
      role: UserRole.ADMIN,
    },
  });
  console.log("✅ Created admin user:", admin.email);

  // Create lawyer users
  const lawyer1 = await prisma.user.upsert({
    where: { email: "t.weber@anspruch123.de" },
    update: {},
    create: {
      email: "t.weber@anspruch123.de",
      name: "Dr. Thomas Weber",
      role: UserRole.LAWYER,
    },
  });

  const lawyer2 = await prisma.user.upsert({
    where: { email: "s.mueller@anspruch123.de" },
    update: {},
    create: {
      email: "s.mueller@anspruch123.de",
      name: "Dr. Sarah Müller",
      role: UserRole.LAWYER,
    },
  });
  console.log("✅ Created lawyer users");

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: "max.mustermann@email.de" },
    update: {},
    create: {
      email: "max.mustermann@email.de",
      name: "Max Mustermann",
      phone: "+49 151 12345678",
      role: UserRole.USER,
    },
  });
  console.log("✅ Created test user:", testUser.email);

  // Create sample cases
  const case1 = await prisma.case.create({
    data: {
      caseNumber: "A123-2024-001",
      userId: testUser.id,
      legalArea: LegalArea.ARBEITSRECHT,
      subCategory: "kuendigung-erhalten",
      status: CaseStatus.IN_PRUEFUNG,
      priority: CasePriority.HOCH,
      assignedLawyerId: lawyer1.id,
      contactInfo: {
        create: {
          email: testUser.email,
          name: testUser.name!,
          phone: testUser.phone,
        },
      },
      details: {
        create: [
          { questionKey: "kuendigungsdatum", answer: "10.01.2024" },
          { questionKey: "betriebsgroesse", answer: "mehr-als-10" },
          { questionKey: "betriebszugehoerigkeit", answer: "5 Jahre" },
          { questionKey: "kuendigungsart", answer: "fristlos" },
          { questionKey: "abmahnung-erhalten", answer: "nein" },
        ],
      },
      deadlines: {
        create: [
          {
            description: "Kündigungsschutzklage einreichen",
            dueDate: new Date("2024-01-31"),
          },
        ],
      },
    },
  });
  console.log("✅ Created case:", case1.caseNumber);

  const case2 = await prisma.case.create({
    data: {
      caseNumber: "A123-2024-002",
      userId: testUser.id,
      legalArea: LegalArea.MIETRECHT,
      subCategory: "maengel-mietminderung",
      status: CaseStatus.ERSTEINSCHAETZUNG,
      priority: CasePriority.NORMAL,
      assignedLawyerId: lawyer2.id,
      contactInfo: {
        create: {
          email: testUser.email,
          name: testUser.name!,
          phone: testUser.phone,
        },
      },
      details: {
        create: [
          { questionKey: "mangel-art", answer: "schimmel" },
          { questionKey: "mangel-seit", answer: "3 Monate" },
          { questionKey: "vermieter-informiert", answer: "ja" },
          { questionKey: "kaltmiete", answer: "850" },
        ],
      },
    },
  });
  console.log("✅ Created case:", case2.caseNumber);

  // Create sample messages
  await prisma.message.createMany({
    data: [
      {
        caseId: case1.id,
        senderId: lawyer1.id,
        receiverId: testUser.id,
        content: "Sehr geehrter Herr Mustermann, vielen Dank für die Übermittlung Ihrer Unterlagen. Ich habe Ihren Fall geprüft und sehe gute Chancen, gegen die Kündigung vorzugehen.",
        isRead: true,
      },
      {
        caseId: case1.id,
        senderId: testUser.id,
        receiverId: lawyer1.id,
        content: "Vielen Dank für die schnelle Rückmeldung! Was sind die nächsten Schritte?",
        isRead: true,
      },
      {
        caseId: case1.id,
        senderId: lawyer1.id,
        receiverId: testUser.id,
        content: "Ich werde zunächst ein Schreiben an Ihren Arbeitgeber aufsetzen und die Kündigung anfechten. Parallel bereite ich die Kündigungsschutzklage vor.",
        isRead: false,
      },
    ],
  });
  console.log("✅ Created sample messages");

  // Create admin notes
  await prisma.adminNote.create({
    data: {
      caseId: case1.id,
      authorId: lawyer1.id,
      content: "Gute Erfolgsaussichten. Keine Abmahnung vor Kündigung, Sozialauswahl fraglich.",
    },
  });
  console.log("✅ Created admin notes");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
