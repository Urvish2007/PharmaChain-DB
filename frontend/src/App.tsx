import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import InventoryDashboard from './pages/InventoryDashboard';
import ExpiryDashboard from './pages/ExpiryDashboard';
import TraceabilityDashboard from './pages/TraceabilityDashboard';
import TransactionsDashboard from './pages/TransactionsDashboard';
import FinancialDashboard from './pages/FinancialDashboard';
import Copilot from './pages/Copilot';
import AmbientBackground from './components/3d/AmbientBackground';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AmbientBackground />
        {/* Isolation wrapper ensures content always renders above the WebGL canvas */}
        <div style={{ position: 'relative', zIndex: 1, isolation: 'isolate' }}>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Protected Main Routes */}
            <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard/inventory" replace />} />
            <Route path="/dashboard/inventory" element={<InventoryDashboard />} />
            <Route path="/dashboard/expiry" element={<ExpiryDashboard />} />
            <Route path="/dashboard/traceability" element={<TraceabilityDashboard />} />
            <Route path="/dashboard/transactions" element={<TransactionsDashboard />} />
            <Route path="/dashboard/financials" element={<FinancialDashboard />} />
            <Route path="/copilot" element={<Copilot />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
