import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Clock, MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OnRoadHeroProps {
  onEmergencyClick?: () => void;
}

export const OnRoadHero = ({ onEmergencyClick }: OnRoadHeroProps) => {
  const navigate = useNavigate();
  
  const handleEmergencyClick = () => {
    if (onEmergencyClick) {
      onEmergencyClick();
    } else {
      navigate("/on-road-services/request");
    }
  };

  const trustFeatures = [
    { icon: Shield, text: "Verified Professionals" },
    { icon: Clock, text: "Quick Response" },
    { icon: MapPin, text: "Available Nearby" },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-b">
      <div className="container py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-400 px-4 py-2 rounded-full text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" />
              Roadside Assistance
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                On-Road Assistance
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Get reliable roadside help when you need it.
              </p>
            </div>

            {/* Emergency CTA */}
            <div className="bg-card rounded-xl p-6 md:p-8 shadow-lg border border-orange-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Need Help Now?</h2>
                  <p className="text-muted-foreground">
                    Choose your problem and request nearby roadside assistance.
                  </p>
                </div>
                <Button 
                  size="lg" 
                  className="bg-orange-600 hover:bg-orange-700 text-white gap-2 shadow-md min-w-[180px]"
                  onClick={handleEmergencyClick}
                >
                  Get Emergency Help
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Trust Features */}
            <div className="flex flex-wrap gap-6 pt-4">
              {trustFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="w-4 h-4 text-primary" />
                    {feature.text}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right - Visual/Illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-gradient-to-br from-blue-100 to-orange-100 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto bg-card rounded-full shadow-lg flex items-center justify-center">
                    <AlertTriangle className="w-16 h-16 text-orange-500 dark:text-orange-400" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">24/7 Support</p>
                  <p className="text-muted-foreground">We're here when you need us</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
