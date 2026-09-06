import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  AlertTriangle, 
  Search, 
  MessageSquare, 
  LogOut,
  Shield,
  Layers,
  DollarSign,
  Archive,
  Menu,
  Lock,
  X,
  Users,
  Activity
} from 'lucide-react';
import { cn } from '../utils/cn';
import PageTransition from '../components/ui/PageTransition';
import { AnimatePresence, motion } from 'framer-motion';

const MainLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
    { name: 'Expiry Risk', href: '/dashboard/expiry', icon: AlertTriangle },
    { name: 'Traceability', href: '/dashboard/traceability', icon: Search },
    { name: 'Transactions', href: '/dashboard/transactions', icon: Layers },
    { name: 'Batches', href: '/dashboard/batches', icon: Archive },
    { name: 'Financials', href: '/dashboard/financials', icon: DollarSign },
    { name: 'Audit Ledger', href: '/dashboard/audit-ledger', icon: Lock },
    { name: 'IoT Telemetry', href: '/dashboard/iot', icon: Activity },
  ];

  const aiNav = [
    { name: 'AI Copilot', href: '/copilot', icon: MessageSquare },
  ];

  const adminNav = [
    { name: 'Staff Directory', href: '/dashboard/staff', icon: Users },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  const NavLink = ({ item, onClick }: { item: typeof navigation[0]; onClick?: () => void }) => {
    const active = isActive(item.href);
    return (
      <Link
        to={item.href}
        onClick={onClick}
        className={cn(
          'group flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200',
          active
            ? 'bg-white/[0.07] text-white'
            : 'text-white/45 hover:bg-white/[0.04] hover:text-white/80'
        )}
      >
        {/* Active indicator bar */}
        <div className={cn(
          'w-[3px] h-4 rounded-full transition-all duration-300',
          active ? 'bg-indigo-400' : 'bg-transparent'
        )} />
        <item.icon
          className={cn(
            'shrink-0 h-[18px] w-[18px] transition-colors duration-200',
            active ? 'text-indigo-400' : 'text-white/30 group-hover:text-white/50'
          )}
          aria-hidden="true"
          strokeWidth={1.75}
        />
        <span>{item.name}</span>
      </Link>
    );
  };

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <>
      <div className="flex-1 flex flex-col pt-7 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 mb-8">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Shield className="h-6 w-6 text-indigo-400" strokeWidth={1.75} />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">PharmaChain</span>
            <span className="block text-[10px] font-medium text-white/25 uppercase tracking-[0.15em]">Compliance</span>
          </div>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.15em] px-3 mb-2">Dashboard</p>
          {navigation.map((item) => (
            <NavLink key={item.name} item={item} onClick={onNavClick} />
          ))}

          <div className="h-px bg-white/[0.04] my-4 mx-3" />

          <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.15em] px-3 mb-2">Intelligence</p>
          {aiNav.map((item) => (
            <NavLink key={item.name} item={item} onClick={onNavClick} />
          ))}

          {user?.role === 'ADMIN' && (
            <>
              <div className="h-px bg-white/[0.04] my-4 mx-3" />
              <p className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.15em] px-3 mb-2">Administration</p>
              {adminNav.map((item) => (
                <NavLink key={item.name} item={item} onClick={onNavClick} />
              ))}
            </>
          )}
        </nav>
      </div>
      
      {/* User Profile */}
      <div className="shrink-0 p-4 border-t border-white/[0.05]">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/80 to-violet-600/80 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg shadow-indigo-500/20">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-[10px] font-medium text-white/25 uppercase tracking-wider truncate">
                {user?.role.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-white/25 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200 shrink-0"
            title="Logout"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden relative z-10 font-sans">
      
      {/* Sidebar — Desktop */}
      <div className="hidden md:flex md:shrink-0 relative z-20">
        <div className="flex flex-col w-60">
          <div className="flex flex-col h-full bg-[#060a14]/80 backdrop-blur-2xl border-r border-white/[0.05]">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed inset-y-0 left-0 w-72 z-50 md:hidden"
            >
              <div className="flex flex-col h-full bg-[#060a14] border-r border-white/[0.05]">
                <SidebarContent onNavClick={() => setMobileMenuOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden relative z-10">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-[#060a14]/80 backdrop-blur-xl shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-400" strokeWidth={1.75} />
            <span className="text-sm font-bold text-white">PharmaChain</span>
          </div>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none scroll-smooth">
          <div className="py-6 md:py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
