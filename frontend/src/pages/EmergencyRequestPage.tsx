import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Bike, Car, Truck, AlertTriangle, Battery, Fuel, Wrench, MapPin, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Service } from "@/types";
import { MiniMap } from "@/components/MiniMap";

type Step = "vehicle" | "problem" | "location" | "confirm" | "submitting" | "success";

const VEHICLE_OPTIONS = [
  { id: "bike", label: "Bike", icon: Bike },
  { id: "car", label: "Car", icon: Car },
  { id: "other", label: "Other", icon: Truck },
];

const PROBLEM_OPTIONS = [
  { id: "puncture", label: "Puncture", icon: AlertTriangle },
  { id: "battery", label: "Battery dead", icon: Battery },
  { id: "fuel", label: "Out of fuel", icon: Fuel },
  { id: "breakdown", label: "Breakdown", icon: Wrench },
  { id: "towing", label: "Towing", icon: Truck },
  { id: "other", label: "Other", icon: Wrench },
];

const SERVICE_MAPPING: Record<string, Record<string, string>> = {
  bike: {
    puncture: "Bike Puncture",
    battery: "Battery Jump Start",
    fuel: "Fuel Assistance",
    breakdown: "Breakdown Repair",
    towing: "Towing",
    other: "Breakdown Repair",
  },
  car: {
    puncture: "Car Puncture",
    battery: "Battery Jump Start",
    fuel: "Fuel Assistance",
    breakdown: "Breakdown Repair",
    towing: "Towing",
    other: "Breakdown Repair",
  },
  other: {
    puncture: "Bike Puncture",
    battery: "Battery Jump Start",
    fuel: "Fuel Assistance",
    breakdown: "Breakdown Repair",
    towing: "Towing",
    other: "Breakdown Repair",
  },
};

const ESTIMATED_PRICES: Record<string, number> = {
  "Bike Puncture": 150,
  "Car Puncture": 300,
  "Battery Jump Start": 400,
  "Fuel Assistance": 500,
  "Breakdown Repair": 600,
  "Towing": 1000,
};

const ESTIMATED_TIMES: Record<string, string> = {
  "Bike Puncture": "15-20 min",
  "Car Puncture": "20-30 min",
  "Battery Jump Start": "10-15 min",
  "Fuel Assistance": "20-30 min",
  "Breakdown Repair": "30-45 min",
  "Towing": "45-60 min",
};

const EmergencyRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>("vehicle");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedProblem, setSelectedProblem] = useState<string>("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [description, setDescription] = useState("");
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await apiRequest<{ services: Service[] }>("/services");
        const onRoadServices = res.services.filter(
          (s) =>
            s.category === "Bike Puncture" ||
            s.category === "Car Puncture" ||
            s.category === "Battery Jump Start" ||
            s.category === "Fuel Assistance" ||
            s.category === "Breakdown Repair" ||
            s.category === "Towing"
        );
        setAvailableServices(onRoadServices);
      } catch (error) {
        console.error("Failed to load services:", error);
      }
    };
    loadServices();
  }, []);

  const handleGetCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            address: "Current location",
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: "Location error",
            description: "Could not get your location. Please enter manually.",
            variant: "destructive",
          });
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Please enter your location manually.",
        variant: "destructive",
      });
      setIsLoadingLocation(false);
    }
  };

  const getServiceName = () => {
    if (!selectedVehicle || !selectedProblem) return "";
    return SERVICE_MAPPING[selectedVehicle]?.[selectedProblem] || "Breakdown Repair";
  };

  const getServicePrice = () => {
    const serviceName = getServiceName();
    return ESTIMATED_PRICES[serviceName] || 600;
  };

  const getServiceTime = () => {
    const serviceName = getServiceName();
    return ESTIMATED_TIMES[serviceName] || "30-45 min";
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to request assistance.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    setStep("submitting");

    try {
      const serviceName = getServiceName();
      const service = availableServices.find((s) => s.category === serviceName);

      if (!service) {
        toast({
          title: "No providers available",
          description: "No providers currently offering this service in your area.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        setStep("confirm");
        return;
      }

      const booking = await apiRequest<{ booking: { id: string } }>("/bookings", {
        method: "POST",
        body: JSON.stringify({
          serviceId: service.id,
          bookingDate: new Date().toISOString(),
        }),
      });

      setCreatedBookingId(booking.booking.id);
      setStep("success");
    } catch (error) {
      console.error("Failed to create booking:", error);
      toast({
        title: "Failed to create request",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      setStep("confirm");
    }
  };

  const renderStep = () => {
    switch (step) {
      case "vehicle":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Select Your Vehicle</h2>
              <p className="text-muted-foreground">Choose the type of vehicle you need assistance for.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {VEHICLE_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedVehicle(option.id)}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      selectedVehicle === option.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-border hover:border-orange-300"
                    }`}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-3 ${selectedVehicle === option.id ? "text-orange-600" : "text-muted-foreground"}`} />
                    <p className="font-semibold text-foreground">{option.label}</p>
                  </button>
                );
              })}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Vehicle number</label>
              <input
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Example: TN 38 AB 1234"
              />
            </div>
          </div>
        );

      case "problem":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">What's the Problem?</h2>
              <p className="text-muted-foreground">Describe the issue you're experiencing.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {PROBLEM_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedProblem(option.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedProblem === option.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-border hover:border-orange-300"
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${selectedProblem === option.id ? "text-orange-600" : "text-muted-foreground"}`} />
                    <p className="font-medium text-foreground text-sm">{option.label}</p>
                  </button>
                );
              })}
            </div>
            {selectedProblem === "other" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Describe your problem</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Please describe your issue..."
                />
              </div>
            )}
          </div>
        );

      case "location":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Location</h2>
              <p className="text-muted-foreground">Help providers find you quickly.</p>
            </div>
            
            <Button
              onClick={handleGetCurrentLocation}
              disabled={isLoadingLocation}
              className="w-full gap-2"
              size="lg"
            >
              {isLoadingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              {isLoadingLocation ? "Getting location..." : "Use Current Location"}
            </Button>

            <div className="text-center text-muted-foreground">or</div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Enter location manually</label>
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your address or landmark"
              />
            </div>

            {location && (
              <div className="space-y-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4">
                <div>
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Location captured</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">{location.address}</p>
                </div>
                <MiniMap
                  height={180}
                  pins={[{ latitude: location.latitude, longitude: location.longitude, label: "Emergency location", type: "customer" }]}
                />
              </div>
            )}
          </div>
        );

      case "confirm":
        const serviceName = getServiceName();
        const price = getServicePrice();
        const time = getServiceTime();

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Confirm Your Request</h2>
              <p className="text-muted-foreground">Review your emergency assistance request.</p>
            </div>

            <div className="bg-muted rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Service</span>
                <span className="font-semibold text-foreground">{serviceName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Vehicle</span>
                <span className="font-semibold text-foreground">{VEHICLE_OPTIONS.find(v => v.id === selectedVehicle)?.label}</span>
              </div>
              {vehicleNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Vehicle Number</span>
                  <span className="font-semibold text-foreground">{vehicleNumber}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Problem</span>
                <span className="font-semibold text-foreground">{PROBLEM_OPTIONS.find(p => p.id === selectedProblem)?.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Location</span>
                <span className="font-semibold text-foreground">{location?.address || manualAddress || "Not specified"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estimated Time</span>
                <span className="font-semibold text-foreground">{time}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-muted-foreground">Estimated Price</span>
                <span className="font-bold text-xl text-orange-600">₹{price}</span>
              </div>
            </div>

            {description && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Additional Details</label>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            )}
          </div>
        );

      case "submitting":
        return (
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-orange-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Finding Nearby Providers...</h2>
            <p className="text-muted-foreground">Please wait while we connect you with available providers.</p>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Request Submitted!</h2>
            <p className="text-muted-foreground mb-6">Your emergency assistance request has been sent to nearby providers.</p>
            <Button
              onClick={() => createdBookingId ? navigate(`/customer/bookings/${createdBookingId}`) : navigate("/customer/bookings")}
              className="gap-2"
            >
              Track Your Request
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        );
    }
  };

  const canProceed = () => {
    switch (step) {
      case "vehicle":
        return !!selectedVehicle;
      case "problem":
        return !!selectedProblem;
      case "location":
        return !!location || !!manualAddress;
      case "confirm":
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === "vehicle") setStep("problem");
    else if (step === "problem") setStep("location");
    else if (step === "location") setStep("confirm");
    else if (step === "confirm") handleSubmit();
  };

  const handleBack = () => {
    if (step === "problem") setStep("vehicle");
    else if (step === "location") setStep("problem");
    else if (step === "confirm") setStep("location");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-2xl py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/on-road-services")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to On-Road Services
          </Button>
        </div>

        <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-lg p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {["vehicle", "problem", "location", "confirm"].map((s, index) => {
              const stepIndex = ["vehicle", "problem", "location", "confirm"].indexOf(step);
              const isCompleted = index < stepIndex;
              const isCurrent = index === stepIndex;
              
              return (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-orange-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  {index < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        index < stepIndex ? "bg-green-500" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {renderStep()}

          {/* Navigation Buttons */}
          {step !== "submitting" && step !== "success" && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === "vehicle"}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="bg-orange-600 hover:bg-orange-700 gap-2"
              >
                {step === "confirm" ? "Request Emergency Help" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyRequestPage;
