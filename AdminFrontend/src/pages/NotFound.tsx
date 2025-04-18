
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zippy-darkest">
      <div className="glass-card p-8 rounded-xl text-center max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto rounded-full bg-zippy-blue/10 flex items-center justify-center text-zippy-blue mb-6">
          <span className="text-4xl font-bold">404</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-gray-400 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="inline-flex items-center gap-2">
          <Link to="/">
            <HomeIcon size={18} />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
