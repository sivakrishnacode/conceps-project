import { useDashboard, useLogout } from '../api/queries';
import { useAuthStore } from '../store';
import { Card } from '../components/ui/Card';
import { LogOut, Wallet, FileText, UserCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { data: dashboard, isLoading } = useDashboard();
  const { mutate: logout } = useLogout();
  const { logout: clearAuth } = useAuthStore();
  const navigate = useNavigate();

  if (isLoading || !dashboard) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const { wallet, kyc, name, mobile } = dashboard;
  const totalBalance = wallet ? Number(wallet.depositBalance) + Number(wallet.winningsBalance) : 0;

  const handleLogout = () => {
    logout({}, {
      onSettled: () => {
        clearAuth();
        navigate('/register', { replace: true });
      }
    });
  };

  const menuItems = [
    { icon: Wallet, label: 'My Wallet', path: '/wallet' },
    { icon: FileText, label: 'Passbook', path: '/passbook' },
    { icon: ShieldCheck, label: 'KYC Verification', path: '/kyc', suffix: kyc?.status },
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-dark-card/80 backdrop-blur top-0 sticky z-10 px-4 py-4 border-b border-dark-border flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
        <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      <div className="p-4 space-y-6 animate-fade-in">
        <Card className="flex items-center gap-4 bg-gradient-to-br from-dark-card to-dark-bg border-primary-500/20">
          <div className="w-16 h-16 rounded-full bg-primary-600/20 flex items-center justify-center border border-primary-500/30">
            <UserCircle className="w-10 h-10 text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{name || 'Player'}</h2>
            <p className="text-gray-400 text-sm tracking-wide">+91 {mobile}</p>
          </div>
        </Card>

        <div className="relative overflow-hidden group hover:border-primary-500/50 transition-colors cursor-pointer glass-card p-6" onClick={() => navigate('/wallet')}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet size={120} />
          </div>
          <p className="text-gray-400 font-medium mb-1 relative z-10">Total Balance</p>
          <h2 className="text-4xl font-black tracking-tight text-white mb-6 relative z-10">
            <span className="text-primary-500 mr-1">₹</span>{totalBalance.toFixed(2)}
          </h2>
          
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Deposit</p>
              <p className="text-lg font-bold">₹{Number(wallet?.depositBalance || 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Winnings</p>
              <p className="text-lg font-bold text-green-400">₹{Number(wallet?.winningsBalance || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-2">Menu</h3>
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-dark-bg border border-dark-border hover:bg-dark-card transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-dark-card group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-colors">
                  <item.icon size={20} />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                {item.suffix && (
                  <span className={`text-xs px-2 py-1 flex items-center rounded-md font-bold ${
                    item.suffix === 'VERIFIED' ? 'bg-green-500/10 text-green-400' :
                    item.suffix === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {item.suffix}
                  </span>
                )}
                <ChevronRight size={20} className="text-gray-500" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
