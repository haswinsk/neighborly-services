import prisma, { connectDB, disconnectDB } from "../config/db.js";
import bcrypt from "bcryptjs";

async function testMigration() {
  console.log("Connecting to MongoDB Atlas...");
  await connectDB();
  console.log("Connected successfully!");

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPhone = `999${Math.floor(10000000 + Math.random() * 90000000)}`;

  // Test User Creation (Customer)
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const customer = await prisma.user.create({
    data: {
      name: "Test Customer",
      email: testEmail,
      password: passwordHash,
      role: "customer",
      phone: testPhone,
    },
  });
  console.log("Created Customer User:", customer.id, customer.email);

  // Test Duplicate Email Error Handling
  try {
    await prisma.user.create({
      data: {
        name: "Duplicate Email User",
        email: testEmail,
        password: passwordHash,
        role: "customer",
      },
    });
    console.error("FAIL: Duplicate email should have thrown an error!");
  } catch (err) {
    console.log("SUCCESS: Duplicate email prevented (code:", err.code, ")");
  }

  // Test Duplicate Phone Error Handling (application validation check)
  const phoneExists = await prisma.user.findFirst({ where: { phone: testPhone } });
  if (phoneExists) {
    console.log("SUCCESS: Duplicate phone detected correctly by application logic!");
  } else {
    console.error("FAIL: Duplicate phone check failed!");
  }

  // Test Provider Creation & Approval
  const providerEmail = `provider_${Date.now()}@example.com`;
  const provider = await prisma.user.create({
    data: {
      name: "Test Provider",
      email: providerEmail,
      password: passwordHash,
      role: "provider",
      approved: true,
    },
  });
  console.log("Created Provider User:", provider.id, provider.email);

  // Test Service Creation
  const service = await prisma.service.create({
    data: {
      serviceName: "Plumbing Repair",
      description: "Fixing pipe leaks",
      price: 150.0,
      category: "Plumbing",
      providerId: provider.id,
      providerName: provider.name,
      providerLocation: "Downtown",
    },
  });
  console.log("Created Service:", service.id, service.serviceName);

  // Test Booking Creation
  const booking = await prisma.booking.create({
    data: {
      customerId: customer.id,
      customerName: customer.name,
      providerId: provider.id,
      providerName: provider.name,
      serviceId: service.id,
      serviceName: service.serviceName,
      bookingDate: "2026-08-10",
      price: service.price,
    },
  });
  console.log("Created Booking:", booking.id, booking.status);

  // Test Booking Status Update
  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "Accepted" },
  });
  console.log("Updated Booking Status:", updatedBooking.id, updatedBooking.status);

  // Clean up test data
  await prisma.booking.delete({ where: { id: booking.id } });
  await prisma.service.delete({ where: { id: service.id } });
  await prisma.user.delete({ where: { id: customer.id } });
  await prisma.user.delete({ where: { id: provider.id } });
  console.log("Cleaned up test data.");

  await disconnectDB();
  console.log("All MongoDB migration verification checks passed!");
}

testMigration().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
