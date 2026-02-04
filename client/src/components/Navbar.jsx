import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BarChart3, LogOut, User, Menu, X, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 rounded-lg blur-xl opacity-40 group-hover:opacity-70 transition-opacity" />
              <div className="relative bg-primary p-2 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>

            <span className="font-bold text-xl text-foreground group-hover:text-primary transition-all tracking-tight">
              MKP Designs
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user && (
              <Link
                to="/designs"
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-muted/50"
              >
                Designs
              </Link>
            )}




            {(!user || user.role !== 'admin') && (
              <Link
                to="/contact"
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-muted/50"
              >
                Contact
              </Link>
            )}

            {user ? (
              <>

                {/* User Profile */}
                <div className="flex items-center space-x-3 px-4 py-2 bg-muted/30 backdrop-blur-sm border border-border rounded-full">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-primary"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                </div>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="group flex items-center space-x-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive px-4 py-2 rounded-full transition-all hover:scale-105"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-muted/50"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="inline-flex items-center px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-medium transition-all hover:scale-105 hover:shadow-lg shadow-primary/20"
                >
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-t border-border animate-fade-in shadow-xl">
          <div className="px-4 py-6 space-y-4">

            {user && (
              <Link
                to="/designs"
                className="block text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg transition-colors hover:bg-muted/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Designs
              </Link>
            )}



            {(!user || user.role !== 'admin') && (
              <Link
                to="/contact"
                className="block text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg transition-colors hover:bg-muted/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg transition-colors hover:bg-muted/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>

                <div className="flex items-center space-x-3 px-4 py-3 bg-muted/50 rounded-lg">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border-2 border-primary"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                  <span className="text-foreground font-medium">{user.name}</span>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg hover:bg-destructive/20 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg transition-colors hover:bg-muted/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="block bg-primary hover:bg-primary/90 text-primary-foreground text-center px-4 py-3 rounded-lg font-medium transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles className="h-4 w-4 inline mr-2" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
