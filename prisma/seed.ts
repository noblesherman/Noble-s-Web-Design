import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const seedEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";

  const admin = await prisma.user.upsert({
    where: { email: seedEmail },
    update: { role: "ADMIN" },
    create: {
      email: seedEmail,
      name: "Admin",
      role: "ADMIN",
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "global" },
    update: {
      primaryAlertEmail: seedEmail,
      alertThreshold: 2,
    },
    create: {
      id: "global",
      primaryAlertEmail: seedEmail,
      alertThreshold: 2,
    },
  });

  const existingTargets = await prisma.uptimeTarget.count();
  if (!existingTargets) {
    await prisma.uptimeTarget.create({
      data: {
        url: "https://example.com",
        checkInterval: 5,
        ownerUserId: admin.id,
      },
    });
  }

  console.log("Seed complete");
}

main()
  .catch((err) => {
    console.error("Seed failed", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
