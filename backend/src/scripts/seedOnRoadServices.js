import prisma, { connectDB, disconnectDB } from "../config/db.js";
import { createPublicId } from "../utils/id.js";
import { ON_ROAD_SERVICES } from "../constants/index.js";

const seedOnRoadServices = async () => {
  console.log("Connecting to database...");
  await connectDB();

  // Find an approved provider to associate services with
  const provider = await prisma.user.findFirst({
    where: { role: "provider", approved: true },
  });

  if (!provider) {
    console.error("\n❌ No approved provider found. Please create and approve a provider first.");
    await disconnectDB();
    process.exit(1);
  }

  console.log(`\n📝 Using provider: ${provider.name} (${provider.email})`);

  // Check if On-Road services already exist for this provider
  const existingServices = await prisma.service.findMany({
    where: {
      providerId: provider.id,
      category: { in: ON_ROAD_SERVICES },
    },
  });

  if (existingServices.length > 0) {
    console.log(`\n⚠️  Found ${existingServices.length} existing On-Road services for this provider.`);
    console.log("Skipping seed to avoid duplicates.");
    console.log("Existing services:");
    existingServices.forEach((s) => console.log(`  - ${s.serviceName}`));
    await disconnectDB();
    process.exit(0);
  }

  // Create On-Road services
  const serviceDescriptions = {
    "Bike Puncture": "Quick roadside puncture repair for motorcycles and scooters. We'll fix your flat tire and get you back on the road.",
    "Car Puncture": "Professional car tire repair and replacement service. We handle punctures, tire changes, and air pressure checks.",
    "Battery Jump Start": "Emergency battery jump-start service for dead batteries. We'll get your vehicle running in minutes.",
    "Fuel Assistance": "Ran out of fuel? We'll deliver emergency fuel to your location so you can reach the nearest petrol station.",
    "Breakdown Repair": "On-the-spot mechanical repairs for common breakdown issues. We diagnose and fix minor problems roadside.",
    "Towing": "Safe and reliable towing service for vehicles that can't be repaired on-site. We transport to your chosen workshop.",
  };

  const servicePrices = {
    "Bike Puncture": 150,
    "Car Puncture": 300,
    "Battery Jump Start": 400,
    "Fuel Assistance": 500,
    "Breakdown Repair": 600,
    Towing: 1000,
  };

  const createdServices = [];

  for (const serviceName of ON_ROAD_SERVICES) {
    try {
      const service = await prisma.service.create({
        data: {
          id: createPublicId("s"),
          serviceName: serviceName,
          description: serviceDescriptions[serviceName],
          price: servicePrices[serviceName],
          category: serviceName,
          providerId: provider.id,
          providerName: provider.name,
          providerLocation: provider.location || "Mobile Service",
          address: provider.address || "",
          city: provider.city || "",
          state: provider.state || "",
          latitude: provider.latitude || null,
          longitude: provider.longitude || null,
          rating: 0,
          reviewCount: 0,
        },
      });
      createdServices.push(service);
      console.log(`✅ Created service: ${serviceName}`);
    } catch (error) {
      console.error(`❌ Failed to create service: ${serviceName}`, error);
    }
  }

  console.log("\n==========================================");
  console.log("ON-ROAD SERVICES SEEDED SUCCESSFULLY!");
  console.log(`Total services created: ${createdServices.length}`);
  console.log("==========================================\n");

  await disconnectDB();
  process.exit(0);
};

seedOnRoadServices().catch((error) => {
  console.error("Failed to seed On-Road services:", error);
  process.exit(1);
});
