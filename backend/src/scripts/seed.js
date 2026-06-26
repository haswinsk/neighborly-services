import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import prisma from "../config/db.js";
import { seedUsers, seedServices, seedBookings, seedReviews } from "../data/seedData.js";

const seed = async () => {
  await connectDB();

  await Promise.all([
    prisma.user.deleteMany(),
    prisma.service.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.review.deleteMany(),
  ]);

  const users = await Promise.all(
    seedUsers.map(async (user) => ({
      ...user,
      password: await bcrypt.hash("password123", 10),
    }))
  );

  await prisma.user.createMany({ data: users });
  await prisma.service.createMany({ data: seedServices });
  await prisma.booking.createMany({ data: seedBookings });
  await prisma.review.createMany({ data: seedReviews });

  console.log("Database seeded successfully");
  process.exit(0);
};

seed().catch((error) => {
  console.error("Failed to seed database", error);
  process.exit(1);
});
