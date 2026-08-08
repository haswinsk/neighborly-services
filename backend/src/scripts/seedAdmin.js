import bcrypt from "bcryptjs";
import prisma, { connectDB, disconnectDB } from "../config/db.js";
import { createPublicId } from "../utils/id.js";

const seedAdmin = async () => {
  console.log("Connecting to database...");
  await connectDB();

  const adminEmail = "admin@neighborly.com";
  const adminPassword = "AdminPassword123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existingAdmin) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: passwordHash,
        role: "admin",
        approved: true,
      },
    });
    console.log("\n✅ Existing Admin user updated successfully!");
  } else {
    await prisma.user.create({
      data: {
        id: createPublicId("a"),
        name: "System Admin",
        email: adminEmail,
        password: passwordHash,
        role: "admin",
        approved: true,
        phone: "1000000000",
        location: "Headquarters",
      },
    });
    console.log("\n✅ New Admin user created successfully!");
  }

  console.log("\n==========================================");
  console.log("ADMIN CREDENTIALS:");
  console.log(`Email:    ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log(`Role:     admin`);
  console.log("==========================================\n");

  await disconnectDB();
  process.exit(0);
};

seedAdmin().catch((error) => {
  console.error("Failed to seed admin credentials:", error);
  process.exit(1);
});
