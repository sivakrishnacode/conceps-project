import { useKycStatus, useKycGenerateOtp, useKycVerifyOtp } from '../api/queries';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, ShieldCheck, Clock, XCircle, FileType, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Kyc = () => {
  const navigate = useNavigate();
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  
  const { data: kyc, isLoading, refetch } = useKycStatus();
  const { mutate: generateOtp, isPending: isGenerating } = useKycGenerateOtp();
  const { mutate: verifyOtp, isPending: isVerifying } = useKycVerifyOtp();

  if (isLoading) return <div className="p-8 text-center pt-24 text-gray-400">Checking KYC status...</div>;

  const handleGenerateOtp = () => {
    if (!/^\d{12}$/.test(aadhaar)) {
      alert('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    generateOtp(aadhaar, {
      onSuccess: () => {
        refetch();
      },
      onError: (err: any) => {
        alert(err.response?.data?.error || 'Failed to generate OTP');
      }
    });
  };

  const handleVerifyOtp = () => {
    if (!/^\d{6}$/.test(otp)) {
      alert('Please enter a 6-digit OTP');
      return;
    }
    verifyOtp(otp, {
      onSuccess: () => {
        refetch();
      },
      onError: (err: any) => {
        alert(err.response?.data?.error || 'Invalid OTP');
      }
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg p-4 flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">KYC Verification</h1>
      </div>

      <Card className="flex-1 flex flex-col justify-center items-center text-center py-12">
        {kyc?.status === 'VERIFIED' ? (
          <div className="space-y-4 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto border sm:border-2 border-green-500/50">
              <ShieldCheck size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white">Full Access Granted!</h2>
            <p className="text-gray-400">Your identity has been successfully verified.</p>

            <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-left space-y-2 max-w-xs mx-auto">
              {kyc?.verifiedName && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Name</span>
                  <span className="text-white font-semibold">{kyc.verifiedName}</span>
                </div>
              )}
              {kyc?.aadhaarNumber && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Aadhaar</span>
                  <span className="text-white font-mono tracking-widest">**** **** {kyc.aadhaarNumber}</span>
                </div>
              )}
            </div>

            <Button onClick={() => navigate(-1)} className="mt-8 bg-white/5 border border-dark-border text-white hover:bg-white/10">
              Go Back
            </Button>
          </div>
        ) : kyc?.status === 'PENDING' ? (
          <div className="space-y-4 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center mx-auto border sm:border-2 border-yellow-500/50">
              <Clock size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white">Verification Pending</h2>
            <p className="text-gray-400">We are reviewing your submission. Please wait...</p>
          </div>
        ) : kyc?.status === 'REJECTED' ? (
          <div className="space-y-4 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto border sm:border-2 border-red-500/50">
              <XCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
            <p className="text-gray-400">Your document was rejected. Please try again with clear photos.</p>
            <Button onClick={() => setAadhaar('')} className="mt-8 w-64 mx-auto">
              Retake Verification
            </Button>
          </div>
        ) : kyc?.status === 'OTP_SENT' ? (
          <div className="space-y-6 w-full max-w-sm mx-auto animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/50">
              <Smartphone size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Enter OTP</h2>
              <p className="text-gray-400 text-sm">
                A 6-digit OTP has been sent to the mobile number linked with Aadhaar ending in <span className="text-white font-bold">XXXX XXXX {kyc.aadhaarNumber}</span>
              </p>
            </div>
            
            <Input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
            />

            <Button onClick={handleVerifyOtp} isLoading={isVerifying} className="w-full py-4 text-lg">
              Verify OTP
            </Button>
            
            <button 
              onClick={() => setAadhaar('')} 
              className="text-sm text-gray-400 hover:text-white transition-colors underline"
            >
              Change Aadhaar Number
            </button>
          </div>
        ) : (
          <div className="space-y-6 w-full animate-slide-up">
            <div className="w-24 h-24 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center mx-auto border border-primary-500/50">
              <FileType size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Verify Your Identity</h2>
              <p className="text-gray-400 text-sm">
                Quick Aadhaar-based e-KYC. Your data is encrypted and handled securely via UIDAI.
              </p>
            </div>
            
            <div className="max-w-sm mx-auto space-y-4">
              <Input
                type="text"
                placeholder="Enter 12-digit Aadhaar Number"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                className="text-center text-lg h-14"
                maxLength={12}
              />
              
              <div className="bg-dark-bg/50 border border-dark-border rounded-xl p-4 text-left space-y-3">
                 <p className="font-semibold text-sm">Requirements:</p>
                 <ul className="text-sm text-gray-400 list-disc pl-5 space-y-1">
                   <li>Mobile must be linked with Aadhaar</li>
                   <li>Aadhaar must be valid and 12-digits</li>
                   <li>You should be 18+ years old</li>
                 </ul>
              </div>

              <Button onClick={handleGenerateOtp} isLoading={isGenerating} className="w-full py-4 text-lg">
                Get OTP
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
