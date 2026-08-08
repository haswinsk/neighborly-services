import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Failed to connect to database", error);
    throw error;
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
};

export default prisma;
