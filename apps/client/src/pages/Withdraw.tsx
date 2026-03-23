import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet, useWithdraw, useKycStatus } from '../api/queries';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const Withdraw = () => {
  const [amount, setAmount] = useState<string>('');
  const navigate = useNavigate();

  const { data: wallet, isLoading: loadingWallet } = useWallet();
  const { data: kyc, isLoading: loadingKyc } = useKycStatus();
  const { mutate: withdraw, isPending } = useWithdraw();

  const totalBalance = (wallet?.depositBalance || 0) + (wallet?.winningsBalance || 0);

  const handleWithdraw = () => {
    withdraw(
      { amount: Number(amount) },
      {
        onSuccess: () => {
          alert('Withdrawal request submitted successfully!');
          navigate('/wallet', { replace: true });
        },
        onError: (err: any) => {
          alert(err.response?.data?.error || 'Withdrawal failed');
        }
      }
    );
  };

  if (loadingWallet || loadingKyc) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-dark-bg p-4 flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Withdraw</h1>
      </div>

      {kyc?.status !== 'VERIFIED' ? (
        <Card className="border-red-500/30 bg-red-500/10 mb-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-red-400 shrink-0 mt-1" />
            <div>
              <h3 className="text-red-400 font-bold mb-1">Verification Required</h3>
              <p className="text-sm text-red-300/80 mb-4">You must complete your KYC verification before withdrawing funds.</p>
              <Button className="w-auto px-6 py-2 bg-red-500 hover:bg-red-600" onClick={() => navigate('/kyc')}>
                Verify Now
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="mb-6 flex-1 flex flex-col justify-center py-10">
        <div className="text-center mb-8">
          <p className="text-gray-400 uppercase tracking-widest text-sm font-medium mb-2">Redeemable Balance</p>
          <h2 className="text-4xl font-bold text-green-400">₹{totalBalance.toFixed(2)}</h2>
          <p className="text-xs text-gray-500 mt-2">Deposit + Winnings combined</p>
        </div>

        <Input
          type="number"
          label="Withdrawal Amount (Min ₹100)"
          placeholder="₹0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="text-xl py-4 font-bold"
        />

        <Button 
          className="mt-8 py-4 text-lg" 
          onClick={handleWithdraw}
          isLoading={isPending}
          disabled={!amount || Number(amount) < 100 || Number(amount) > totalBalance || kyc?.status !== 'VERIFIED'}
        >
          Withdraw Money
        </Button>
      </Card>
    </div>
  );
};
