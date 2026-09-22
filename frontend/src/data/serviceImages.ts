import plumbingImg from "@/assets/services/plumbing.jpg";
import electricalImg from "@/assets/services/electrical.jpg";
import acRepairImg from "@/assets/services/ac-repair.jpg";
import cleaningImg from "@/assets/services/cleaning.jpg";
import carpentryImg from "@/assets/services/carpentry.jpg";
import tutoringImg from "@/assets/services/tutoring.jpg";
import paintingImg from "@/assets/services/painting.jpg";
import pestControlImg from "@/assets/services/pest-control.jpg";

export const serviceImages: Record<string, string> = {
  Plumbing: plumbingImg,
  Electrical: electricalImg,
  "AC Repair": acRepairImg,
  Cleaning: cleaningImg,
  Carpentry: carpentryImg,
  Tutoring: tutoringImg,
  Painting: paintingImg,
  "Pest Control": pestControlImg,
  // On-Road Services - using fallback image for now
  "Bike Puncture": plumbingImg,
  "Car Puncture": plumbingImg,
  "Battery Jump Start": plumbingImg,
  "Fuel Assistance": plumbingImg,
  "Breakdown Repair": plumbingImg,
  Towing: plumbingImg,
};

export const getServiceImage = (category: string): string => {
  return serviceImages[category] || plumbingImg;
};
