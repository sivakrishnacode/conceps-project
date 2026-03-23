import { useNavigate } from 'react-router-dom';
import { useWallet } from '../api/queries';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowDownLeft, ArrowUpRight, ArrowLeft } from 'lucide-react';

export const Wallet = () => {
  const { data: wallet, isLoading } = useWallet();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="bg-dark-card/80 backdrop-blur top-0 sticky z-10 px-4 py-4 border-b border-dark-border flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">My Wallet</h1>
      </div>

      <div className="p-4 space-y-6 animate-fade-in">
        <Card className="bg-gradient-to-br from-primary-900/50 to-primary-800/20 border-primary-500/30 text-center py-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <p className="text-gray-300 font-medium mb-2">Total Balance</p>
          <h2 className="text-5xl font-black tracking-tight text-white mb-2">
            <span className="text-primary-400 mr-1">₹</span>
            {wallet?.totalBalance?.toFixed(2) || '0.00'}
          </h2>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="flex flex-col items-center justify-center py-6 border-dark-border">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Deposit</p>
            <p className="text-2xl font-bold">₹{wallet?.depositBalance?.toFixed(2) || '0.00'}</p>
          </Card>
          <Card className="flex flex-col items-center justify-center py-6 border-dark-border">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Winnings</p>
            <p className="text-2xl font-bold text-green-400">₹{wallet?.winningsBalance?.toFixed(2) || '0.00'}</p>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button 
            className="py-4" 
            onClick={() => navigate('/add-money')}
          >
            <ArrowDownLeft size={20} className="mr-1" />
            Add Money
          </Button>
          <Button 
            variant="secondary"
            className="py-4 bg-dark-card border border-dark-border"
            onClick={() => navigate('/withdraw')}
          >
            <ArrowUpRight size={20} className="mr-1" />
            Withdraw
          </Button>
        </div>
      </div>
    </div>
  );
};
