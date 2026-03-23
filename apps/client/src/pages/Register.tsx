import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../api/queries';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const Register = () => {
  const [mobile, setMobile] = useState('');
  const [isAgeCertified, setIsAgeCertified] = useState(false);
  const { mutate: register, isPending } = useRegister();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(
      { mobile, isAgeCertified },
      {
        onSuccess: () => {
          navigate('/verify-otp', { state: { mobile } });
        },
        onError: (err: any) => {
          alert(err.response?.data?.error || 'Registration failed');
        }
      }
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Welcome
          </h1>
          <p className="text-gray-400 mt-2">Enter your mobile number to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Mobile Number"
            type="tel"
            placeholder="e.g. 9876543210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            maxLength={10}
            required
            pattern="[0-9]{10}"
          />

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center mt-1">
              <input
                type="checkbox"
                required
                checked={isAgeCertified}
                onChange={(e) => setIsAgeCertified(e.target.checked)}
                className="peer w-5 h-5 appearance-none rounded border border-dark-border bg-dark-bg/50 checked:bg-primary-500 checked:border-transparent transition-all"
              />
              <svg className="absolute w-3 h-3 pointer-events-none opacity-0 peer-checked:opacity-100 top-1 left-1" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              I certify that I am over 18 years old and agree to the Terms of Service.
            </span>
          </label>

          <Button type="submit" isLoading={isPending} className="mt-4">
            Get OTP
          </Button>
        </form>
      </Card>
    </div>
  );
};
