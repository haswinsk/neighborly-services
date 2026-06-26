import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Service } from "../models/Service.js";
import { Booking } from "../models/Booking.js";
import { Review } from "../models/Review.js";
import { seedUsers, seedServices, seedBookings, seedReviews } from "../data/seedData.js";

const seed = async () => {
  await connectDB(env.mongoUri);

  await Promise.all([
    User.deleteMany({}),
    Service.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
  ]);

  const users = await Promise.all(
    seedUsers.map(async (user) => ({
      ...user,
      password: await bcrypt.hash("password123", 10),
    }))
  );

  await User.insertMany(users);
  await Service.insertMany(seedServices);
  await Booking.insertMany(seedBookings);
  await Review.insertMany(seedReviews);

  console.log("Database seeded successfully");
  process.exit(0);
};

seed().catch((error) => {
  console.error("Failed to seed database", error);
  process.exit(1);
});
