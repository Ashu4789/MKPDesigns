import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-background overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Custom Spinner */}
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col items-center space-y-2">
            <h3 className="text-2xl font-bold font-display tracking-tight text-foreground">
              MKP <span className="text-primary">Designs</span>
            </h3>
            <p className="text-sm text-muted-foreground animate-pulse font-medium">
              Loading My Portfolio....
            </p>
          </div>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
