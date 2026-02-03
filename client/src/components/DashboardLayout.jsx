import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  FileText,
  Settings,
  Menu,
  X,
  Package,
  MapPin,
  Users
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Overview', icon: <LayoutDashboard className="h-5 w-5" />, path: '/dashboard' },
    { name: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/dashboard/settings' }
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`group fixed lg:static inset-y-0 left-0 z-50 w-20 lg:w-20 
        ${sidebarOpen ? 'w-64' : ''} 
        lg:hover:w-64 
        bg-card/40 backdrop-blur-md border-r border-border/50 shadow-xl 
        transform transition-all duration-300 ease-in-out overflow-hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">

          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <h2 className="flex items-center space-x-3">
              <LayoutDashboard className="h-6 w-6 text-primary flex-shrink-0" />
              <span className="hidden lg:inline-block lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 text-xl font-bold text-foreground whitespace-nowrap overflow-hidden tracking-tight">
                MKP Designs
              </span>
            </h2>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center lg:space-x-3 px-4 py-3 rounded-lg transition-all justify-center lg:justify-start
                  ${isActive
                      ? 'bg-primary/10 text-primary font-semibold pl-3 border-l-4 border-primary lg:pl-4 shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                >
                  <div className="flex-shrink-0">{item.icon}</div>

                  <span className="hidden lg:inline-block lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200 whitespace-nowrap overflow-hidden">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border/50 lg:opacity-0 lg:group-hover:opacity-100 lg:max-h-0 lg:group-hover:max-h-40 overflow-hidden transition-all duration-300 pointer-events-none lg:group-hover:pointer-events-auto">
            <div className="bg-card border border-border/50 rounded-lg p-4 shadow-sm">
              <p className="text-sm font-semibold text-primary mb-1">
                Need Help?
              </p>
              <p className="text-xs text-muted-foreground">
                Check documentation for guides and tutorials
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden pt-20 lg:pt-8 bg-background">

        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm px-4 py-3 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-lg font-semibold text-foreground">
            Dashboard
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
