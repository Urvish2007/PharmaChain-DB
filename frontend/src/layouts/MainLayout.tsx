import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  AlertTriangle, 
  Search, 
  MessageSquare, 
  LogOut,
  Shield
} from 'lucide-react';
import { cn } from '../utils/cn';
import PageTransition from '../components/ui/PageTransition';
import { AnimatePresence } from 'framer-motion';

const MainLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Inventory Shortage', href: '/dashboard/inventory', icon: Package },
    { name: 'Expiry Risk', href: '/dashboard/expiry', icon: AlertTriangle },
    { name: 'Batch Traceability', href: '/dashboard/traceability', icon: Search },
    { name: 'AI Copilot', href: '/copilot', icon: MessageSquare },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen overflow-hidden relative z-10 font-sans">
      
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:flex-shrink-0 relative z-20">
        <div className="flex flex-col w-72">
          {/* Glass Sidebar */}
          <div className="flex flex-col h-full bg-[#0f172a]/60 backdrop-blur-xl border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
            <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
              <div className="flex items-center px-6 mb-8">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <Shield className="h-8 w-8 text-blue-400" />
                </div>
                <span className="ml-3 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white tracking-tight">PharmaChain</span>
              </div>
              <nav className="flex-1 px-4 space-y-2">
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300',
                        active
                          ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'mr-4 flex-shrink-0 h-5 w-5 transition-colors duration-300',
                          active ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-300'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {/* User Profile Area */}
            <div className="flex-shrink-0 p-4 border-t border-white/10 bg-black/20">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg border border-white/20">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user?.username}</p>
                    <p className="text-xs font-medium text-blue-300/80 uppercase tracking-wider">
                      {user?.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden relative z-10">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none scroll-smooth">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <Outlet />
                </PageTransition>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
