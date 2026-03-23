import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddMoney, useApplyPromo } from '../api/queries';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const AddMoney = () => {
  const [amount, setAmount] = useState<string>('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; bonus: number } | null>(null);
  const navigate = useNavigate();

  const { mutate: addMoney, isPending } = useAddMoney();
  const { mutate: applyPromo, isPending: isValidatingPromo } = useApplyPromo();

  const quickAmounts = [30, 50, 75, 100, 150];

  const handleApplyPromo = () => {
    if (!promoCode || !amount) return;
    applyPromo(
      { code: promoCode, depositAmount: Number(amount) },
      {
        onSuccess: (res) => {
          setAppliedPromo({ code: promoCode, bonus: res.bonus });
        },
        onError: (err: any) => {
          alert(err.response?.data?.error || 'Invalid promo code');
          setAppliedPromo(null);
        }
      }
    );
  };

  const handleProceed = () => {
    if (!amount || isNaN(Number(amount))) return;
    
    addMoney(
      { amount: Number(amount), promoCode: appliedPromo?.code },
      {
        onSuccess: () => {
          alert('Money added successfully!');
          navigate('/wallet', { replace: true });
        },
        onError: (err: any) => {
          alert(err.response?.data?.error || 'Failed to add money');
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-dark-bg p-4 relative pb-24">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Add Money</h1>
      </div>

      <Card className="mb-6">
        <Input
          type="number"
          placeholder="₹ Amount"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (appliedPromo) setAppliedPromo(null); // Reset promo on amount change
          }}
          className="text-2xl font-bold text-center py-6"
        />

        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => {
                setAmount(amt.toString());
                if (appliedPromo) setAppliedPromo(null);
              }}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                Number(amount) === amt
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'border-dark-border text-gray-400 hover:bg-dark-border'
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Have a Promo Code?</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter Code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            disabled={!!appliedPromo}
          />
          {!appliedPromo ? (
            <Button 
              className="w-auto px-6" 
              onClick={handleApplyPromo}
              isLoading={isValidatingPromo}
              disabled={!promoCode || !amount}
            >
              Apply
            </Button>
          ) : (
            <Button className="w-auto px-4 bg-green-500/20 text-green-400 border border-green-500/50" disabled>
              <CheckCircle2 size={20} />
            </Button>
          )}
        </div>
        {appliedPromo && (
          <p className="text-sm text-green-400 font-medium">
            Promo applied! You will receive ₹{appliedPromo.bonus} bonus.
          </p>
        )}
      </Card>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-dark-bg/80 backdrop-blur-lg border-t border-dark-border">
        <Button 
          className="w-full text-lg py-4" 
          onClick={handleProceed}
          isLoading={isPending}
          disabled={!amount || Number(amount) <= 0}
        >
          Proceed to Pay ₹{amount || '0'}
        </Button>
      </div>
    </div>
  );
};
