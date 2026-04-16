import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center sera-gradient-navy px-6">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-serif font-light text-sera-ivory">404</h1>
        <p className="mb-6 text-lg text-sera-sand">Oops! Page not found</p>
        <a href="/" className="text-sera-sand underline underline-offset-4 hover:text-sera-ivory transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
