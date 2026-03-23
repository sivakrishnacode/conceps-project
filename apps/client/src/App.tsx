import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Register } from './pages/Register';
import { OtpVerify } from './pages/OtpVerify';
import { SaveName } from './pages/SaveName';
import { Dashboard } from './pages/Dashboard';
import { Wallet } from './pages/Wallet';
import { AddMoney } from './pages/AddMoney';
import { Withdraw } from './pages/Withdraw';
import { Passbook } from './pages/Passbook';
import { Kyc } from './pages/Kyc';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OtpVerify />} />
        <Route path="/save-name" element={
          <ProtectedRoute>
            <SaveName />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={
          <ProtectedRoute requireVerified>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/wallet" element={
          <ProtectedRoute requireVerified>
            <Wallet />
          </ProtectedRoute>
        } />

        <Route path="/add-money" element={
          <ProtectedRoute requireVerified>
            <AddMoney />
          </ProtectedRoute>
        } />

        <Route path="/withdraw" element={
          <ProtectedRoute requireVerified>
            <Withdraw />
          </ProtectedRoute>
        } />

        <Route path="/passbook" element={
          <ProtectedRoute requireVerified>
            <Passbook />
          </ProtectedRoute>
        } />

        <Route path="/kyc" element={
          <ProtectedRoute requireVerified>
            <Kyc />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
