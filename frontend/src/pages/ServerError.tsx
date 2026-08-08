import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, AlertCircle } from "lucide-react";

const ServerError = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-block">
            <div className="relative">
              <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-2" />
              <div className="text-5xl font-bold text-red-600">500</div>
            </div>
            <div className="h-1 w-16 bg-red-500 rounded-full mx-auto mt-4"></div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">Server Error</h1>
        <p className="text-muted-foreground mb-2">Something went wrong on our end.</p>
        <p className="text-sm text-muted-foreground mb-8">We're working to fix the issue. Please try again in a moment.</p>
        
        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link to="/" className="block">
            <Button variant="outline" className="w-full gap-2" size="lg">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Error ID:</span><br />
            <code className="text-xs text-gray-600">ERR_{Date.now()}</code><br />
            <span className="text-xs mt-2 block">If the problem persists, please contact our support team</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
