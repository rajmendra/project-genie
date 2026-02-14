import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BranchProvider } from './context/BranchContext';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ViewBalance from './pages/wallet/ViewBalance';
import WalletHistory from './pages/wallet/WalletHistory';
import AddMoney from './pages/wallet/AddMoney';
import ExpenseMaster from './pages/ExpenseMaster';
import Notifications from './pages/Notifications';
import ContactGenie from './pages/ContactGenie';
import RemittanceMaster from './pages/RemittanceMaster';
import ComingSoon from './pages/ComingSoon';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BranchProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/wallet" element={<Navigate to="/wallet/balance" replace />} />
              <Route path="/wallet/balance" element={<ViewBalance />} />
              <Route path="/wallet/history" element={<WalletHistory />} />
              <Route path="/wallet/add-money" element={<AddMoney />} />
              <Route path="/account-master" element={<ComingSoon />} />
              <Route path="/team-master" element={<ComingSoon />} />
              <Route path="/member-master" element={<ComingSoon />} />
              <Route path="/lead-master" element={<ComingSoon />} />
              <Route path="/expense-master" element={<ExpenseMaster />} />
              <Route path="/session-master" element={<ComingSoon />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/contact-genie" element={<ContactGenie />} />
              <Route path="/remittance-master" element={<RemittanceMaster />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BranchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
