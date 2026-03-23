import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useVerifyOtp } from '../api/queries';
import { useAuthStore } from '../store';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const OtpVerify = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { mutate: verifyOtp, isPending } = useVerifyOtp();
  const { setAuth } = useAuthStore();

  const mobile = location.state?.mobile;

  useEffect(() => {
    if (inputs.current[0]) inputs.current[0].focus();
  }, []);

  if (!mobile) return <Navigate to="/register" replace />;

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling && element.value !== '') {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    verifyOtp(
      { mobile, otp: otpValue },
      {
        onSuccess: (response) => {
          const data = response.data;
          if (response.isNewUser) {
            setAuth(data.accessToken, null as any, data.user);
            navigate('/save-name', { replace: true });
          } else {
            setAuth(data.accessToken, data.refreshToken, data.user);
            navigate('/', { replace: true });
          }
        },
        onError: (err: any) => {
          alert(err.response?.data?.error || 'Invalid OTP');
        }
      }
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md animate-fade-in text-center">
        <h1 className="text-2xl font-bold mb-2">Verification</h1>
        <p className="text-gray-400 mb-8 text-sm">
          Enter the 6-digit code sent to +91 {mobile}
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-2 sm:gap-4">
            {otp.map((data, index) => (
              <input
                className="w-12 h-14 text-center text-xl font-bold bg-dark-bg/50 border border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                type="text"
                name="otp"
                maxLength={1}
                key={index}
                value={data}
                onChange={e => handleChange(e.target, index)}
                onFocus={e => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !data && inputs.current[index - 1]) {
                    inputs.current[index - 1]!.focus();
                  }
                }}
                ref={el => { inputs.current[index] = el; }}
              />
            ))}
          </div>

          <Button 
            type="submit" 
            isLoading={isPending} 
            disabled={otp.join('').length !== 6}
          >
            Verify Code
          </Button>
        </form>
      </Card>
    </div>
  );
};
