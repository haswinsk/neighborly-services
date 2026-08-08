import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-block">
            <div className="text-7xl font-bold text-primary mb-2">404</div>
            <div className="h-1 w-16 bg-primary rounded-full mx-auto"></div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-2">Sorry, we couldn't find the page you're looking for.</p>
        <p className="text-sm text-muted-foreground mb-8">The page might have been moved or deleted.</p>
        
        <div className="space-y-3">
          <Link to="/" className="block">
            <Button className="w-full gap-2" size="lg">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
        
        <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Still need help?</span><br />
            Try browsing our <Link to="/services" className="text-primary hover:underline">services</Link> or contact support
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
